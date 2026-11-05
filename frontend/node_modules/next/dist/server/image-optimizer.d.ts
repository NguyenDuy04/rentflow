import type { IncomingMessage, ServerResponse } from 'http';
import type { ImageConfigComplete } from '../shared/lib/image-config';
import type { NextConfigComplete, NextConfigRuntime } from './config-shared';
import type { NextUrlWithParsedQuery } from './request-meta';
import { type IncrementalCacheValue, type IncrementalResponseCacheEntry } from './response-cache';
import type { CacheHandler } from './lib/incremental-cache';
import type { CacheControl } from './lib/cache-control';
import { type LookupFunction } from 'net';
import { type LookupAddress } from 'dns';
import { type ImageUpstream } from './image-optimizer/transform';
export { ImageError } from './image-optimizer/image-error';
type XCacheHeader = 'MISS' | 'HIT' | 'STALE';
export interface ImageParamsResult {
    href: string;
    isAbsolute: boolean;
    isStatic: boolean;
    width: number;
    quality: number;
    mimeType: string;
    sizes: number[];
    minimumCacheTTL: number;
}
export declare class ImageOptimizerCache {
    private cacheDir;
    private nextConfig;
    private cacheHandler?;
    private cacheDiskLRU?;
    private isDiskCacheEnabled?;
    static validateParams(req: IncomingMessage, query: NextUrlWithParsedQuery['query'], nextConfig: NextConfigRuntime, isDev: boolean): ImageParamsResult | {
        errorMessage: string;
    };
    static getCacheKey({ href, width, quality, mimeType, }: {
        href: string;
        width: number;
        quality: number;
        mimeType: string;
    }): string;
    constructor({ distDir, nextConfig, cacheHandler, }: {
        distDir: string;
        nextConfig: NextConfigRuntime;
        cacheHandler?: CacheHandler;
    });
    get(cacheKey: string): Promise<IncrementalResponseCacheEntry | null>;
    set(cacheKey: string, value: IncrementalCacheValue | null, { cacheControl, }: {
        cacheControl?: CacheControl;
    }): Promise<void>;
}
/**
 * Pins the connection to `addresses` instead of letting it resolve `hostname`
 * a second time. Checking addresses up front only proves where the name
 * pointed at that moment; the socket runs its own lookup, so a record that
 * changes in between (DNS rebinding) would otherwise still reach a private IP.
 *
 * Every address in the list was checked, so all of them are handed back to
 * keep Node's happy eyeballs failover between IPv6 and IPv4 intact.
 */
export declare function createPinnedLookup(hostname: string, addresses: LookupAddress[]): LookupFunction;
export declare function fetchExternalImage(href: string, dangerouslyAllowLocalIP: boolean, maximumResponseBody: number, count?: number): Promise<ImageUpstream>;
export declare function fetchInternalImage(href: string, _req: IncomingMessage, _res: ServerResponse, maximumResponseBody: number, handleRequest: (newReq: IncomingMessage, newRes: ServerResponse, newParsedUrl?: NextUrlWithParsedQuery) => Promise<void>): Promise<ImageUpstream>;
export declare function imageOptimizer(imageUpstream: ImageUpstream, paramsResult: Pick<ImageParamsResult, 'href' | 'width' | 'quality' | 'mimeType'>, nextConfig: {
    experimental: Pick<NextConfigComplete['experimental'], 'imgOptConcurrency' | 'imgOptOperationCache' | 'imgOptMaxInputPixels' | 'imgOptSequentialRead' | 'imgOptTimeoutInSeconds' | 'imgOptMozjpeg'>;
    images: Pick<NextConfigComplete['images'], 'dangerouslyAllowSVG' | 'minimumCacheTTL'>;
}, opts: {
    isDev?: boolean;
    silent?: boolean;
    previousCacheEntry?: IncrementalResponseCacheEntry | null;
}): Promise<{
    buffer: Buffer;
    contentType: string;
    maxAge: number;
    etag: string;
    upstreamEtag: string;
    error?: unknown;
}>;
export declare function sendResponse(req: IncomingMessage, res: ServerResponse, url: string, extension: string, buffer: Buffer, etag: string, isStatic: boolean, xCache: XCacheHeader, imagesConfig: ImageConfigComplete, maxAge: number, isDev: boolean): void;
