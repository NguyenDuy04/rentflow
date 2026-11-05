// WARNING: Please keep this module lightweight with very few imports since
// we intend to run it in a child process in the future. Please do NOT
// add new imports without considering their impact on its dependency graph.
import isAnimated from 'next/dist/compiled/is-animated';
import isError from '../../lib/is-error';
import { detectContentType } from './detect-content-type';
import { AVIF, BMP, GIF, HEIC, ICNS, ICO, JPEG, JXL, PNG, SVG, WEBP } from './image-type';
import { getImageEtag } from './extract-etag';
import { getMaxAge } from './get-max-age';
import { ImageError } from './image-error';
const ANIMATABLE_TYPES = [
    WEBP,
    PNG,
    GIF
];
const BYPASS_TYPES = [
    SVG,
    ICO,
    ICNS,
    BMP,
    JXL,
    HEIC
];
let _sharp;
export function getSharp(concurrency, operationCache) {
    if (_sharp) {
        return _sharp;
    }
    try {
        _sharp = require('sharp');
        _sharp.block({
            operation: [
                'VipsForeignLoad'
            ]
        });
        _sharp.unblock({
            operation: [
                'VipsForeignLoadHeif',
                'VipsForeignLoadJpeg',
                'VipsForeignLoadNsgif',
                'VipsForeignLoadPng',
                'VipsForeignLoadSvg',
                'VipsForeignLoadTiff',
                'VipsForeignLoadWebp'
            ]
        });
        if (typeof operationCache === 'boolean') {
            _sharp.cache(operationCache);
        }
        if (_sharp.concurrency() > 1) {
            // Reducing concurrency should reduce the memory usage too.
            // We more aggressively reduce in dev but also reduce in prod.
            // https://sharp.pixelplumbing.com/api-utility#concurrency
            const divisor = process.env.NODE_ENV === 'development' ? 4 : 2;
            _sharp.concurrency(concurrency ?? Math.floor(Math.max(_sharp.concurrency() / divisor, 1)));
        }
    } catch (e) {
        if (isError(e) && e.code === 'MODULE_NOT_FOUND') {
            throw new Error('Module `sharp` not found. Please run `npm install --cpu=wasm32 sharp` to install it.');
        }
        throw e;
    }
    return _sharp;
}
export async function optimizeImage({ buffer, contentType, quality, width, height, concurrency, operationCache, limitInputPixels, sequentialRead, timeoutInSeconds, mozjpeg = true }) {
    const sharp = getSharp(concurrency, operationCache);
    const transformer = sharp(buffer, {
        limitInputPixels,
        sequentialRead: sequentialRead ?? undefined
    }).timeout({
        seconds: timeoutInSeconds ?? 7
    }).rotate();
    if (height) {
        transformer.resize(width, height);
    } else {
        transformer.resize(width, undefined, {
            withoutEnlargement: true
        });
    }
    if (contentType === AVIF) {
        transformer.avif({
            // Scale the quality to try and match webp. This ratio was derived
            // from sharp's default 80 (webp) and 50 (avif), and then verified
            // using dssim and ssimulacra2 visual quality tests.
            quality: Math.max(Math.round(quality * (50 / 80)), 1),
            effort: 3
        });
    } else if (contentType === WEBP) {
        transformer.webp({
            quality
        });
    } else if (contentType === PNG) {
        transformer.png({
            quality
        });
    } else if (contentType === JPEG) {
        transformer.jpeg({
            quality,
            mozjpeg
        });
    }
    const optimizedBuffer = await transformer.toBuffer();
    return optimizedBuffer;
}
export async function imageOptimizerTransform(imageUpstream, paramsResult, nextConfig, opts = {}) {
    const { href, quality, width, mimeType } = paramsResult;
    const { buffer: upstreamBuffer, etag: upstreamEtag } = imageUpstream;
    const maxAge = Math.max(nextConfig.images.minimumCacheTTL, getMaxAge(imageUpstream.cacheControl));
    const upstreamType = await detectContentType(upstreamBuffer);
    if (!upstreamType || !upstreamType.startsWith('image/') || upstreamType.includes(',')) {
        var _opts_logger;
        (_opts_logger = opts.logger) == null ? void 0 : _opts_logger.error("The requested resource isn't a valid image for", href, 'received', upstreamType);
        throw new ImageError(400, "The requested resource isn't a valid image.");
    }
    if (upstreamType.startsWith('image/svg') && !nextConfig.images.dangerouslyAllowSVG) {
        var _opts_logger1;
        (_opts_logger1 = opts.logger) == null ? void 0 : _opts_logger1.error(`The requested resource "${href}" has type "${upstreamType}" but dangerouslyAllowSVG is disabled. Consider adding the "unoptimized" property to the <Image>.`);
        throw new ImageError(400, '"url" parameter is valid but image type is not allowed');
    }
    if (ANIMATABLE_TYPES.includes(upstreamType) && isAnimated(upstreamBuffer)) {
        var _opts_logger2;
        (_opts_logger2 = opts.logger) == null ? void 0 : _opts_logger2.warnOnce(`The requested resource "${href}" is an animated image so it will not be optimized. Consider adding the "unoptimized" property to the <Image>.`);
        return {
            buffer: upstreamBuffer,
            contentType: upstreamType,
            maxAge,
            etag: upstreamEtag,
            upstreamEtag
        };
    }
    if (BYPASS_TYPES.includes(upstreamType)) {
        return {
            buffer: upstreamBuffer,
            contentType: upstreamType,
            maxAge,
            etag: upstreamEtag,
            upstreamEtag
        };
    }
    let contentType;
    if (mimeType) {
        contentType = mimeType;
    } else if (upstreamType === WEBP || upstreamType === AVIF) {
        // Downlevel WebP and AVIF when the client does not advertise support.
        contentType = JPEG;
    } else {
        contentType = upstreamType;
    }
    if (opts.previousOutput) {
        return {
            buffer: opts.previousOutput.buffer,
            contentType,
            maxAge: opts.previousOutput.maxAge || maxAge,
            etag: opts.previousOutput.etag,
            upstreamEtag: opts.previousOutput.upstreamEtag
        };
    }
    try {
        let optimizedBuffer = await optimizeImage({
            buffer: upstreamBuffer,
            contentType,
            quality,
            width,
            concurrency: nextConfig.experimental.imgOptConcurrency,
            operationCache: nextConfig.experimental.imgOptOperationCache,
            limitInputPixels: nextConfig.experimental.imgOptMaxInputPixels,
            sequentialRead: nextConfig.experimental.imgOptSequentialRead,
            timeoutInSeconds: nextConfig.experimental.imgOptTimeoutInSeconds,
            mozjpeg: nextConfig.experimental.imgOptMozjpeg
        });
        if (opts.handleDevOutput) {
            const output = await opts.handleDevOutput(optimizedBuffer, contentType);
            optimizedBuffer = output.buffer;
            contentType = output.contentType;
        }
        return {
            buffer: optimizedBuffer,
            contentType,
            maxAge,
            etag: getImageEtag(optimizedBuffer),
            upstreamEtag
        };
    } catch (error) {
        // If we fail to optimize, fallback to the original image
        return {
            buffer: upstreamBuffer,
            contentType: upstreamType,
            maxAge: nextConfig.images.minimumCacheTTL,
            etag: upstreamEtag,
            upstreamEtag,
            error
        };
    }
}

//# sourceMappingURL=transform.js.map