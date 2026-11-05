import { promises } from 'fs';
import { Agent as HttpAgent, request as httpRequest } from 'http';
import { Agent as HttpsAgent, request as httpsRequest } from 'https';
import { mediaType } from 'next/dist/compiled/@hapi/accept';
import contentDisposition from 'next/dist/compiled/content-disposition';
import { join } from 'path';
import { getImageBlurSvg } from '../shared/lib/image-blur-svg';
import { hasLocalMatch } from '../shared/lib/match-local-pattern';
import { hasRemoteMatch } from '../shared/lib/match-remote-pattern';
import { MockedRequest, MockedResponse } from './lib/mock-request';
import { CachedRouteKind, IncrementalCacheKind } from './response-cache';
import { sendEtagResponse } from './send-payload';
import { getContentType, getExtension } from './serve-static';
import * as Log from '../build/output/log';
import { isPrivateIp } from './is-private-ip';
import { getOrInitDiskLRU } from './lib/disk-lru-cache.external';
import { parseUrl, parseReqUrl } from '../lib/url';
import { InvariantError } from '../shared/lib/invariant-error';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { ADDRCONFIG } from 'dns';
import { pipeline, Transform } from 'stream';
import { constants as zlibConstants, createBrotliDecompress, createGunzip, createInflate, createInflateRaw } from 'zlib';
import { imageOptimizerTransform } from './image-optimizer/transform';
import { extractEtag, getHash } from './image-optimizer/extract-etag';
import { getPreviouslyCachedImageOrNull } from './image-optimizer/get-previously-cached-image-or-null';
import { getImageSize } from './image-optimizer/get-image-size';
import { ImageError } from './image-optimizer/image-error';
// `next-server.ts` destructures `ImageError` from this module to check
// `instanceof` on errors thrown by the transform.
export { ImageError } from './image-optimizer/image-error';
const CACHE_VERSION = 4;
const BLUR_IMG_SIZE = 8 // should match `next-image-loader`
;
const BLUR_QUALITY = 70 // should match `next-image-loader`
;
async function initCacheEntries(cacheDir) {
    const cacheKeys = await promises.readdir(cacheDir).catch(()=>[]);
    const entries = [];
    for (const cacheKey of cacheKeys){
        try {
            const { expireAt, buffer } = await readFromCacheDir(cacheDir, cacheKey);
            entries.push({
                key: cacheKey,
                size: buffer.byteLength,
                expireAt
            });
        } catch  {
        // Skip entries that can't be read from disk
        }
    }
    // Sort oldest-first so we can replay them chronologically into LRU
    return entries.sort((a, b)=>a.expireAt - b.expireAt);
}
function getSupportedMimeType(options, accept = '') {
    const mimeType = mediaType(accept, options);
    return accept.includes(mimeType) ? mimeType : '';
}
async function writeToCacheDir(cacheDir, cacheKey, extension, maxAge, expireAt, buffer, etag, upstreamEtag) {
    if (buffer.byteLength === 0) {
        throw new Error('Invariant: cannot write an empty buffer to the image cache');
    }
    const dir = join(/* turbopackIgnore: true */ cacheDir, cacheKey);
    const filename = join(/* turbopackIgnore: true */ dir, `${maxAge}.${expireAt}.${etag}.${upstreamEtag}.${extension}`);
    await promises.rm(dir, {
        recursive: true,
        force: true
    }).catch(()=>{});
    await promises.mkdir(dir, {
        recursive: true
    });
    await promises.writeFile(filename, buffer);
}
async function readFromCacheDir(cacheDir, cacheKey) {
    const dir = join(/* turbopackIgnore: true */ cacheDir, cacheKey);
    const files = await promises.readdir(dir);
    const file = files[0];
    if (!file) {
        throw new Error(`Invariant: cache entry "${cacheKey}" not found in dir "${cacheDir}"`);
    }
    const [maxAgeSt, expireAtSt, etag, upstreamEtag, extension] = file.split('.', 5);
    const filePath = join(/* turbopackIgnore: true */ dir, file);
    const buffer = await promises.readFile(/* turbopackIgnore: true */ filePath);
    if (buffer.byteLength === 0) {
        throw new Error(`Invariant: image cache entry "${cacheKey}" is empty`);
    }
    const expireAt = Number(expireAtSt);
    const maxAge = Number(maxAgeSt);
    return {
        maxAge,
        expireAt,
        etag,
        upstreamEtag,
        buffer,
        extension
    };
}
async function deleteFromCacheDir(cacheDir, cacheKey) {
    return promises.rm(join(/* turbopackIgnore: true */ cacheDir, cacheKey), {
        recursive: true,
        force: true
    }).catch((err)=>{
        Log.error(`Failed to delete cache key ${cacheKey}`, err);
    });
}
export class ImageOptimizerCache {
    static validateParams(req, query, nextConfig, isDev) {
        var _nextConfig_images, _nextConfig_images1, _nextConfig_images2;
        const imageData = nextConfig.images;
        const { deviceSizes = [], imageSizes = [], domains = [], minimumCacheTTL = 14400, formats = [
            'image/webp'
        ] } = imageData;
        const remotePatterns = ((_nextConfig_images = nextConfig.images) == null ? void 0 : _nextConfig_images.remotePatterns) || [];
        const localPatterns = (_nextConfig_images1 = nextConfig.images) == null ? void 0 : _nextConfig_images1.localPatterns;
        const qualities = (_nextConfig_images2 = nextConfig.images) == null ? void 0 : _nextConfig_images2.qualities;
        const { url, w, q } = query;
        let href;
        if (domains.length > 0) {
            Log.warnOnce('The "images.domains" configuration is deprecated. Please use "images.remotePatterns" configuration instead.');
        }
        if (!url) {
            return {
                errorMessage: '"url" parameter is required'
            };
        } else if (Array.isArray(url)) {
            return {
                errorMessage: '"url" parameter cannot be an array'
            };
        }
        if (url.length > 3072) {
            return {
                errorMessage: '"url" parameter is too long'
            };
        }
        if (url.startsWith('//')) {
            return {
                errorMessage: '"url" parameter cannot be a protocol-relative URL (//)'
            };
        }
        let isAbsolute;
        if (url.startsWith('/')) {
            var _parseUrl;
            href = url;
            isAbsolute = false;
            if (/\/_next\/image($|\/)/.test(decodeURIComponent(((_parseUrl = parseUrl(url)) == null ? void 0 : _parseUrl.pathname) ?? ''))) {
                return {
                    errorMessage: '"url" parameter cannot be recursive'
                };
            }
            if (!hasLocalMatch(localPatterns, url)) {
                return {
                    errorMessage: '"url" parameter is not allowed'
                };
            }
        } else {
            let hrefParsed;
            try {
                hrefParsed = new URL(url);
                href = hrefParsed.toString();
                isAbsolute = true;
            } catch (_error) {
                return {
                    errorMessage: '"url" parameter is invalid'
                };
            }
            if (![
                'http:',
                'https:'
            ].includes(hrefParsed.protocol)) {
                return {
                    errorMessage: '"url" parameter is invalid'
                };
            }
            if (!hasRemoteMatch(domains, remotePatterns, hrefParsed)) {
                return {
                    errorMessage: '"url" parameter is not allowed'
                };
            }
        }
        if (!w) {
            return {
                errorMessage: '"w" parameter (width) is required'
            };
        } else if (Array.isArray(w)) {
            return {
                errorMessage: '"w" parameter (width) cannot be an array'
            };
        } else if (!/^[0-9]+$/.test(w)) {
            return {
                errorMessage: '"w" parameter (width) must be an integer greater than 0'
            };
        }
        if (!q) {
            return {
                errorMessage: '"q" parameter (quality) is required'
            };
        } else if (Array.isArray(q)) {
            return {
                errorMessage: '"q" parameter (quality) cannot be an array'
            };
        } else if (!/^[0-9]+$/.test(q)) {
            return {
                errorMessage: '"q" parameter (quality) must be an integer between 1 and 100'
            };
        }
        const width = parseInt(w, 10);
        if (width <= 0 || isNaN(width)) {
            return {
                errorMessage: '"w" parameter (width) must be an integer greater than 0'
            };
        }
        const sizes = [
            ...deviceSizes || [],
            ...imageSizes || []
        ];
        if (isDev) {
            sizes.push(BLUR_IMG_SIZE);
        }
        const isValidSize = sizes.includes(width) || isDev && width <= BLUR_IMG_SIZE;
        if (!isValidSize) {
            return {
                errorMessage: `"w" parameter (width) of ${width} is not allowed`
            };
        }
        const quality = parseInt(q, 10);
        if (isNaN(quality) || quality < 1 || quality > 100) {
            return {
                errorMessage: '"q" parameter (quality) must be an integer between 1 and 100'
            };
        }
        if (qualities && !qualities.includes(quality) && !(isDev && quality === BLUR_QUALITY)) {
            return {
                errorMessage: `"q" parameter (quality) of ${q} is not allowed`
            };
        }
        const mimeType = getSupportedMimeType(formats || [], req.headers['accept']);
        const isStatic = url.startsWith(`${nextConfig.basePath || ''}/_next/static/media`) || url.startsWith(`${nextConfig.basePath || ''}/_next/static/immutable/media`);
        return {
            href,
            sizes,
            isAbsolute,
            isStatic,
            width,
            quality,
            mimeType,
            minimumCacheTTL
        };
    }
    static getCacheKey({ href, width, quality, mimeType }) {
        return getHash([
            CACHE_VERSION,
            href,
            width,
            quality,
            mimeType
        ]);
    }
    constructor({ distDir, nextConfig, cacheHandler }){
        this.cacheDir = join(/* turbopackIgnore: true */ distDir, 'cache', 'images');
        this.nextConfig = nextConfig;
        this.cacheHandler = cacheHandler;
        // Eagerly start LRU initialization for filesystem cache
        if (!cacheHandler && nextConfig.images.maximumDiskCacheSize !== 0 && nextConfig.experimental.isrFlushToDisk) {
            this.isDiskCacheEnabled = true;
            this.cacheDiskLRU = getOrInitDiskLRU(this.cacheDir, nextConfig.images.maximumDiskCacheSize, initCacheEntries, deleteFromCacheDir);
        }
    }
    async get(cacheKey) {
        // If a custom cache handler is provided, use it
        if (this.cacheHandler) {
            try {
                const cacheData = await this.cacheHandler.get(cacheKey, {
                    kind: IncrementalCacheKind.IMAGE,
                    isFallback: false
                });
                if (!(cacheData == null ? void 0 : cacheData.value)) {
                    return null;
                }
                if (cacheData.value.kind !== CachedRouteKind.IMAGE) {
                    return null;
                }
                const now = Date.now();
                const lastModified = cacheData.lastModified || now;
                const revalidate = typeof cacheData.value.revalidate === 'number' ? cacheData.value.revalidate : this.nextConfig.images.minimumCacheTTL;
                const revalidateAfter = Math.max(revalidate, this.nextConfig.images.minimumCacheTTL) * 1000 + lastModified;
                const isStale = revalidateAfter < now;
                return {
                    value: cacheData.value,
                    revalidateAfter,
                    cacheControl: {
                        revalidate,
                        expire: undefined
                    },
                    isStale
                };
            } catch (_) {
            // failed to get from custom cache handler, treat as cache miss
            }
            return null;
        }
        // If the filesystem cache is disabled, return early
        if (!this.isDiskCacheEnabled) {
            return null;
        }
        // Fall back to filesystem cache
        try {
            const now = Date.now();
            const { maxAge, expireAt, etag, upstreamEtag, buffer, extension } = await readFromCacheDir(this.cacheDir, cacheKey);
            // Promote entry in LRU (mark as recently used)
            const lru = await this.cacheDiskLRU;
            lru == null ? void 0 : lru.get(cacheKey);
            return {
                value: {
                    kind: CachedRouteKind.IMAGE,
                    etag,
                    buffer,
                    extension,
                    upstreamEtag
                },
                revalidateAfter: Math.max(maxAge, this.nextConfig.images.minimumCacheTTL) * 1000 + Date.now(),
                cacheControl: {
                    revalidate: maxAge,
                    expire: undefined
                },
                isStale: now > expireAt
            };
        } catch (_) {
        // failed to read from cache dir, treat as cache miss
        }
        return null;
    }
    async set(cacheKey, value, { cacheControl }) {
        if ((value == null ? void 0 : value.kind) !== CachedRouteKind.IMAGE) {
            throw new Error('invariant attempted to set non-image to image-cache');
        }
        const revalidate = cacheControl == null ? void 0 : cacheControl.revalidate;
        if (typeof revalidate !== 'number') {
            throw new InvariantError('revalidate must be a number for image-cache');
        }
        // If a custom cache handler is provided, use it
        if (this.cacheHandler) {
            try {
                // Apply minimumCacheTTL at write time, similar to the implementation in the fallback filesystem cache
                const effectiveRevalidate = Math.max(revalidate, this.nextConfig.images.minimumCacheTTL);
                const valueWithRevalidate = {
                    ...value,
                    revalidate: effectiveRevalidate
                };
                await this.cacheHandler.set(cacheKey, valueWithRevalidate, {
                    kind: IncrementalCacheKind.IMAGE,
                    cacheControl: {
                        revalidate: effectiveRevalidate,
                        expire: cacheControl == null ? void 0 : cacheControl.expire
                    }
                });
            } catch (err) {
                Log.error(`Failed to write image to custom cache ${cacheKey}`, err);
            }
            return;
        }
        // If the filesystem cache is disabled, return early
        if (!this.isDiskCacheEnabled) {
            return;
        }
        // Fall back to filesystem cache
        const expireAt = Math.max(revalidate, this.nextConfig.images.minimumCacheTTL) * 1000 + Date.now();
        try {
            const lru = await this.cacheDiskLRU;
            const success = lru == null ? void 0 : lru.set(cacheKey, value.buffer.byteLength);
            if (success === false) {
                throw new Error(`image of size ${value.buffer.byteLength} could not be tracked by lru cache`);
            }
            await writeToCacheDir(this.cacheDir, cacheKey, value.extension, revalidate, expireAt, value.buffer, value.etag, value.upstreamEtag);
        } catch (err) {
            Log.error(`Failed to write image to cache ${cacheKey}`, err);
        }
    }
}
function isRedirect(statusCode) {
    return [
        301,
        302,
        303,
        307,
        308
    ].includes(statusCode);
}
function upstreamTimedOut(href) {
    Log.error('upstream image response timed out for', href);
    return new ImageError(504, '"url" parameter is valid but upstream response timed out');
}
const agentOptions = {
    keepAlive: true,
    timeout: 7000
};
const getHttpAgentName = HttpAgent.prototype.getName;
const getHttpsAgentName = HttpsAgent.prototype.getName;
class ImageHttpAgent extends HttpAgent {
    getName(options = {}) {
        return `${getHttpAgentName.call(this, options)}:${options.imageLookupKey ?? ''}`;
    }
}
class ImageHttpsAgent extends HttpsAgent {
    getName(options = {}) {
        return `${getHttpsAgentName.call(this, options)}:${options.imageLookupKey ?? ''}`;
    }
}
let protectedHttpAgent;
let protectedHttpsAgent;
let permissiveHttpAgent;
let permissiveHttpsAgent;
function getImageAgent(dangerouslyAllowLocalIP, isHttps) {
    if (isHttps) {
        if (dangerouslyAllowLocalIP) {
            return permissiveHttpsAgent ??= new ImageHttpsAgent(agentOptions);
        }
        return protectedHttpsAgent ??= new ImageHttpsAgent(agentOptions);
    }
    if (dangerouslyAllowLocalIP) {
        return permissiveHttpAgent ??= new ImageHttpAgent(agentOptions);
    }
    return protectedHttpAgent ??= new ImageHttpAgent(agentOptions);
}
const BASE_REQ_HEADERS = {
    accept: '*/*',
    'accept-language': '*',
    'sec-fetch-mode': 'cors',
    'user-agent': 'node'
};
const HTTP_FETCH_HEADERS = {
    ...BASE_REQ_HEADERS,
    'accept-encoding': 'gzip, deflate'
};
const HTTPS_FETCH_HEADERS = {
    ...BASE_REQ_HEADERS,
    'accept-encoding': 'br, gzip, deflate'
};
/**
 * Resolves `hostname` with the DNS options the socket itself would have used,
 * so the addresses checked below are the exact set the connection can reach.
 * Mirrors `lookupAndConnect()` in Node's `lib/net.js`.
 */ function lookupAsSocketWould(hostname) {
    return lookup(hostname, {
        all: true,
        // Node applies ADDRCONFIG whenever no address family is requested,
        // on every platform except Windows.
        hints: process.platform === 'win32' ? 0 : ADDRCONFIG
    });
}
/**
 * Pins the connection to `addresses` instead of letting it resolve `hostname`
 * a second time. Checking addresses up front only proves where the name
 * pointed at that moment; the socket runs its own lookup, so a record that
 * changes in between (DNS rebinding) would otherwise still reach a private IP.
 *
 * Every address in the list was checked, so all of them are handed back to
 * keep Node's happy eyeballs failover between IPv6 and IPv4 intact.
 */ export function createPinnedLookup(hostname, addresses) {
    return (lookupHostname, options, callback)=>{
        if (lookupHostname !== hostname) {
            callback(new InvariantError(`Image lookup hostname "${lookupHostname}" does not match request hostname "${hostname}"`), []);
            return;
        }
        const family = typeof options.family === 'number' ? options.family : 0;
        const matched = family ? addresses.filter((address)=>address.family === family) : addresses;
        if (matched.length === 0) {
            // Reporting this as an error rather than an empty list is not optional:
            // Node destructures the first address, so the resulting TypeError is
            // thrown inside the socket and escapes the request entirely.
            const err = new Error(`No IPv${family} address available for ${hostname}`);
            err.code = 'ENODATA';
            callback(err, []);
            return;
        }
        if (options.all) {
            callback(null, matched);
        } else {
            callback(null, matched[0].address, matched[0].family);
        }
    };
}
function requestUpstreamImage(url, pinnedLookup, imageLookupKey, dangerouslyAllowLocalIP, signal) {
    return new Promise((resolve, reject)=>{
        const isHttps = url.protocol === 'https:';
        const request = isHttps ? httpsRequest : httpRequest;
        const options = {
            agent: getImageAgent(dangerouslyAllowLocalIP, isHttps),
            headers: isHttps ? HTTPS_FETCH_HEADERS : HTTP_FETCH_HEADERS,
            imageLookupKey,
            lookup: pinnedLookup,
            signal
        };
        const req = request(url, options, resolve);
        req.on('error', reject);
        req.end();
    });
}
class DeflateDecoder extends Transform {
    constructor(){
        super();
        this.decoder = undefined;
    }
    _transform(chunk, encoding, callback) {
        if (!this.decoder) {
            if (chunk.length === 0) {
                callback();
                return;
            }
            const options = {
                flush: zlibConstants.Z_SYNC_FLUSH,
                finishFlush: zlibConstants.Z_SYNC_FLUSH
            };
            this.decoder = (chunk[0] & 0x0f) === 0x08 ? createInflate(options) : createInflateRaw(options);
            this.decoder.on('data', (data)=>this.push(data));
            this.decoder.on('end', ()=>this.push(null));
            this.decoder.on('error', (err)=>this.destroy(err));
        }
        this.decoder.write(chunk, encoding, callback);
    }
    _final(callback) {
        var _this_decoder;
        (_this_decoder = this.decoder) == null ? void 0 : _this_decoder.end();
        this.decoder = undefined;
        callback();
    }
}
// Matches the chain limit of native fetch (undici), so an upstream cannot
// force unbounded decoder allocations with the header alone.
const MAX_CONTENT_ENCODINGS = 5;
function decodeResponseBody(res, href) {
    const contentEncoding = res.headers['content-encoding'];
    if (!contentEncoding) {
        return res;
    }
    const codings = contentEncoding.toLowerCase().split(',');
    if (codings.length > MAX_CONTENT_ENCODINGS) {
        Log.error('upstream image response had too many content encodings for', href);
        throw new ImageError(400, '"url" parameter is valid but upstream response is invalid');
    }
    const decoders = [];
    for(let i = codings.length - 1; i >= 0; i--){
        switch(codings[i].trim()){
            case 'x-gzip':
            case 'gzip':
                decoders.push(createGunzip({
                    flush: zlibConstants.Z_SYNC_FLUSH,
                    finishFlush: zlibConstants.Z_SYNC_FLUSH
                }));
                break;
            case 'deflate':
                decoders.push(new DeflateDecoder());
                break;
            case 'br':
                decoders.push(createBrotliDecompress({
                    flush: zlibConstants.BROTLI_OPERATION_FLUSH,
                    finishFlush: zlibConstants.BROTLI_OPERATION_FLUSH
                }));
                break;
            default:
                return res;
        }
    }
    pipeline([
        res,
        ...decoders
    ], ()=>{});
    return decoders[decoders.length - 1];
}
export async function fetchExternalImage(href, dangerouslyAllowLocalIP, maximumResponseBody, count = 3) {
    const url = new URL(href);
    // `URL.hostname` keeps the brackets around an IPv6 literal, the socket does not
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    let pinnedLookup;
    let imageLookupKey;
    if (!dangerouslyAllowLocalIP) {
        const literalFamily = isIP(hostname);
        let addresses;
        if (literalFamily > 0) {
            // A literal address is connected to as-is, without any DNS resolution
            addresses = [
                {
                    address: hostname,
                    family: literalFamily
                }
            ];
        } else {
            addresses = await lookupAsSocketWould(hostname);
            pinnedLookup = createPinnedLookup(hostname, addresses);
        }
        imageLookupKey = addresses.map((address)=>`${address.family}:${address.address}`).join(',');
        const privateIps = addresses.map((record)=>record.address).filter((ip)=>isPrivateIp(ip));
        if (privateIps.length > 0) {
            Log.error('upstream image', href, 'hostname resolved to private IP', JSON.stringify(privateIps), 'If this is expected and you understand SSRF risk, use images.dangerouslyAllowLocalIP = true to continue.');
            throw new ImageError(400, '"url" parameter is not allowed');
        }
    }
    // The signal is owned here rather than by `requestUpstreamImage()` because it
    // has to stay readable while the body streams. Node reports an abort during
    // the body as a plain `ECONNRESET` on the response, so the signal is the only
    // way to tell a timeout apart from the upstream resetting the connection.
    const signal = AbortSignal.timeout(agentOptions.timeout);
    let res;
    try {
        res = await requestUpstreamImage(url, pinnedLookup, imageLookupKey, dangerouslyAllowLocalIP, signal);
    } catch (err) {
        if (signal.aborted) {
            throw upstreamTimedOut(href);
        }
        throw err;
    }
    const statusCode = res.statusCode;
    if (statusCode === undefined) {
        res.destroy();
        throw new InvariantError('Expected statusCode on upstream image response');
    }
    const locationHeader = res.headers.location;
    if (isRedirect(statusCode) && locationHeader && URL.canParse(locationHeader, href)) {
        // Discard the body rather than draining it. A redirect body is never used,
        // and draining one would download unlimited bytes from the upstream because
        // `maximumResponseBody` is only enforced on the final response.
        res.destroy();
        if (count === 0) {
            Log.error('upstream image response had too many redirects', href);
            throw new ImageError(508, '"url" parameter is valid but upstream response is invalid');
        }
        const redirect = new URL(locationHeader, href).href;
        return fetchExternalImage(redirect, dangerouslyAllowLocalIP, maximumResponseBody, count - 1);
    }
    if (statusCode < 200 || statusCode > 299) {
        res.destroy();
        Log.error('upstream image response failed for', href, statusCode);
        throw new ImageError(statusCode, '"url" parameter is valid but upstream response is invalid');
    }
    const chunks = [];
    let totalSize = 0;
    try {
        const body = decodeResponseBody(res, href);
        // Throwing out of this loop destroys the response, so an oversized or
        // timed out download stops instead of running to completion.
        for await (const chunk of body){
            totalSize += chunk.byteLength;
            if (totalSize > maximumResponseBody) {
                Log.error('upstream image response exceeded maximum size for', href, totalSize);
                throw new ImageError(413, '"url" parameter is valid but upstream response is invalid');
            }
            chunks.push(chunk);
        }
    } catch (err) {
        res.destroy();
        if (signal.aborted) {
            throw upstreamTimedOut(href);
        }
        throw err;
    }
    if (totalSize === 0) {
        Log.error('upstream image response is empty for', href);
        throw new ImageError(400, '"url" parameter is valid but upstream response is invalid');
    }
    const buffer = Buffer.concat(chunks);
    const contentType = res.headers['content-type'];
    const cacheControl = res.headers['cache-control'];
    const etag = extractEtag(res.headers.etag, buffer);
    return {
        buffer,
        contentType,
        cacheControl,
        etag
    };
}
export async function fetchInternalImage(href, _req, _res, maximumResponseBody, handleRequest) {
    try {
        // Coerce HEAD to GET to avoid issues with the image optimizer
        const method = !_req.method || _req.method === 'HEAD' ? 'GET' : _req.method;
        // The mocked request keeps the requester's socket so that protocol and
        // remote address detection keep working, but the mocked response must not
        // reference it. `send` (used by `serveStatic`) watches `res.socket` through
        // `on-finished` and treats the response as finished as soon as that socket
        // stops being writable. When the requester disconnected mid-transfer this
        // tore down the file stream without ever ending the mocked response, and
        // since `ResponseCache` coalesces every request for the same cache key onto
        // this single fetch, the key stayed pending for every later requester until
        // the server restarted.
        const mocked = {
            req: new MockedRequest({
                url: href,
                method,
                headers: {},
                socket: _req.socket
            }),
            res: new MockedResponse({
                maximumResponseBody
            })
        };
        await handleRequest(mocked.req, mocked.res, parseReqUrl(href));
        await mocked.res.hasStreamed;
        if (!mocked.res.statusCode || mocked.res.statusCode < 200 || mocked.res.statusCode > 299) {
            Log.error('internal image response failed for', href, mocked.res.statusCode);
            throw new ImageError(mocked.res.statusCode, '"url" parameter is valid but internal response is invalid');
        }
        if (mocked.res.buffers.length === 0) {
            Log.error('internal image response is empty for', href);
            throw new ImageError(400, '"url" parameter is valid but internal response is invalid');
        }
        const buffer = Buffer.concat(mocked.res.buffers);
        const contentType = mocked.res.getHeader('Content-Type');
        const cacheControl = mocked.res.getHeader('Cache-Control');
        const etag = extractEtag(mocked.res.getHeader('ETag'), buffer);
        return {
            buffer,
            contentType,
            cacheControl,
            etag
        };
    } catch (err) {
        if (err instanceof ImageError) {
            throw err;
        }
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_MAX_BODY_SIZE_EXCEEDED') {
            Log.error('internal image response exceeded maximum size for', href);
            throw new ImageError(413, '"url" parameter is valid but internal response is invalid');
        }
        Log.error('upstream image response failed for', href, err);
        throw new ImageError(500, '"url" parameter is valid but upstream response is invalid');
    }
}
async function makeBlurPlaceholder(buffer, contentType) {
    // During `next dev`, we don't want to generate blur placeholders with webpack
    // because it can delay starting the dev server. Instead, `next-image-loader.js`
    // will inline a special url to lazily generate the blur placeholder at request time.
    const meta = await getImageSize(buffer);
    const blurOpts = {
        blurWidth: meta.width,
        blurHeight: meta.height,
        blurDataURL: `data:${contentType};base64,${buffer.toString('base64')}`
    };
    return {
        buffer: Buffer.from(unescape(getImageBlurSvg(blurOpts))),
        contentType: 'image/svg+xml'
    };
}
export async function imageOptimizer(imageUpstream, paramsResult, nextConfig, opts) {
    var _opts_previousCacheEntry_cacheControl, _opts_previousCacheEntry;
    const previouslyCachedImage = getPreviouslyCachedImageOrNull(imageUpstream, opts.previousCacheEntry);
    return imageOptimizerTransform(imageUpstream, paramsResult, nextConfig, {
        previousOutput: previouslyCachedImage ? {
            buffer: previouslyCachedImage.buffer,
            maxAge: ((_opts_previousCacheEntry = opts.previousCacheEntry) == null ? void 0 : (_opts_previousCacheEntry_cacheControl = _opts_previousCacheEntry.cacheControl) == null ? void 0 : _opts_previousCacheEntry_cacheControl.revalidate) || undefined,
            etag: previouslyCachedImage.etag,
            upstreamEtag: previouslyCachedImage.upstreamEtag
        } : undefined,
        logger: opts.silent ? undefined : Log,
        handleDevOutput: opts.isDev && paramsResult.width <= BLUR_IMG_SIZE && paramsResult.quality === BLUR_QUALITY ? makeBlurPlaceholder : undefined
    });
}
function getFileNameWithExtension(url, contentType) {
    const [urlWithoutQueryParams] = url.split('?', 1);
    const fileNameWithExtension = urlWithoutQueryParams.split('/').pop();
    if (!contentType || !fileNameWithExtension) {
        return 'image.bin';
    }
    const [fileName] = fileNameWithExtension.split('.', 1);
    const extension = getExtension(contentType);
    return `${fileName}.${extension}`;
}
function setResponseHeaders(req, res, url, etag, contentType, isStatic, xCache, imagesConfig, maxAge, isDev) {
    res.setHeader('Vary', 'Accept');
    res.setHeader('Cache-Control', isStatic ? 'public, max-age=315360000, immutable' : `public, max-age=${isDev ? 0 : maxAge}, must-revalidate`);
    if (sendEtagResponse(req, res, etag)) {
        // already called res.end() so we're finished
        return {
            finished: true
        };
    }
    if (contentType) {
        res.setHeader('Content-Type', contentType);
    }
    const fileName = getFileNameWithExtension(url, contentType);
    res.setHeader('Content-Disposition', contentDisposition(fileName, {
        type: imagesConfig.contentDispositionType
    }));
    res.setHeader('Content-Security-Policy', imagesConfig.contentSecurityPolicy);
    res.setHeader('X-Nextjs-Cache', xCache);
    return {
        finished: false
    };
}
export function sendResponse(req, res, url, extension, buffer, etag, isStatic, xCache, imagesConfig, maxAge, isDev) {
    const contentType = getContentType(extension);
    const result = setResponseHeaders(req, res, url, etag, contentType, isStatic, xCache, imagesConfig, maxAge, isDev);
    if (!result.finished) {
        res.setHeader('Content-Length', Buffer.byteLength(buffer));
        // A response body must not be sent for HEAD requests
        if (req.method === 'HEAD') {
            res.end();
        } else {
            res.end(buffer);
        }
    }
}

//# sourceMappingURL=image-optimizer.js.map