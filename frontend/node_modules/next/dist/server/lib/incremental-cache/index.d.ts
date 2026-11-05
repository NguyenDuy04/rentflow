import type { CacheFs } from '../../../shared/lib/utils';
import type { PrerenderManifest } from '../../../build';
import { type IncrementalCacheValue, type IncrementalCache as IncrementalCacheType, type IncrementalResponseCacheEntry, type IncrementalFetchCacheEntry, type GetIncrementalFetchCacheContext, type GetIncrementalResponseCacheContext, type GetIncrementalResponseCacheHandlerContext, type GetIncrementalImageCacheContext, type CachedFetchValue, type SetIncrementalFetchCacheContext, type SetIncrementalResponseCacheContext, type SetIncrementalResponseCacheHandlerContext, type SetIncrementalImageCacheContext } from '../../response-cache';
import type { DeepReadonly } from '../../../shared/lib/deep-readonly';
import type { CacheControl } from '../cache-control';
import type { __ApiPreviewProps } from '../../api-utils';
export interface CacheHandlerContext {
    fs?: CacheFs;
    dev?: boolean;
    flushToDisk?: boolean;
    serverDistDir?: string;
    maxMemoryCacheSize?: number;
    fetchCacheKeyPrefix?: string;
    prerenderManifest?: PrerenderManifest;
    revalidatedTags: string[];
    _requestHeaders: IncrementalCache['requestHeaders'];
}
export interface CacheHandlerValue {
    lastModified: number;
    age?: number;
    cacheState?: string;
    value: IncrementalCacheValue | null;
    /**
     * The entry's cache lifetime, as passed to `set()` in `ctx.cacheControl`.
     * A cache handler that stores it and returns it here lets any instance serve
     * the entry with its lifetime, including one that did not render it (another
     * server sharing the cache, or the same server after a restart).
     */
    cacheControl?: CacheControl;
}
export declare class CacheHandler {
    constructor(_ctx: CacheHandlerContext);
    get(_cacheKey: string, _ctx: GetIncrementalFetchCacheContext | GetIncrementalResponseCacheHandlerContext | GetIncrementalImageCacheContext): Promise<CacheHandlerValue | null>;
    set(_cacheKey: string, _data: IncrementalCacheValue | null, _ctx: SetIncrementalFetchCacheContext | SetIncrementalResponseCacheHandlerContext | SetIncrementalImageCacheContext): Promise<void>;
    revalidateTag(_tags: string | string[], _durations?: {
        expire?: number;
    }): Promise<void>;
    resetRequestCache(): void;
}
export declare class IncrementalCache implements IncrementalCacheType {
    readonly dev?: boolean;
    readonly disableForTestmode?: boolean;
    readonly cacheHandler?: CacheHandler;
    readonly hasCustomCacheHandler: boolean;
    readonly previewProps: DeepReadonly<__ApiPreviewProps>;
    readonly prerenderManifest: DeepReadonly<PrerenderManifest>;
    readonly requestHeaders: Record<string, undefined | string | string[]>;
    readonly allowedRevalidateHeaderKeys?: string[];
    readonly minimalMode?: boolean;
    readonly fetchCacheKeyPrefix?: string;
    readonly isOnDemandRevalidate?: boolean;
    readonly revalidatedTags?: readonly string[];
    private static readonly debug;
    private readonly locks;
    /**
     * The cache controls for routes. This will source the values from the
     * prerender manifest until the in-memory cache is updated with new values.
     */
    private readonly cacheControls;
    private readonly locales?;
    constructor({ fs, dev, flushToDisk, minimalMode, serverDistDir, requestHeaders, maxMemoryCacheSize, previewProps, prerenderManifest, fetchCacheKeyPrefix, CurCacheHandler, allowedRevalidateHeaderKeys, locales, }: {
        fs?: CacheFs;
        dev: boolean;
        minimalMode?: boolean;
        serverDistDir?: string;
        flushToDisk?: boolean;
        allowedRevalidateHeaderKeys?: string[];
        locales?: readonly string[];
        requestHeaders: IncrementalCache['requestHeaders'];
        maxMemoryCacheSize?: number;
        previewProps: DeepReadonly<__ApiPreviewProps>;
        prerenderManifest: DeepReadonly<PrerenderManifest>;
        fetchCacheKeyPrefix?: string;
        CurCacheHandler?: typeof CacheHandler;
    });
    private calculateRevalidate;
    resetRequestCache(): void;
    lock(cacheKey: string): Promise<() => Promise<void> | void>;
    revalidateTag(tags: string | string[], durations?: {
        expire?: number;
    }): Promise<void>;
    generateSimpleCacheKey(input: string): Promise<string>;
    generateCacheKey(url: string, init?: RequestInit | Request): Promise<string>;
    get(cacheKey: string, ctx: GetIncrementalFetchCacheContext): Promise<IncrementalFetchCacheEntry | null>;
    get(cacheKey: string, ctx: GetIncrementalResponseCacheContext | GetIncrementalImageCacheContext): Promise<IncrementalResponseCacheEntry | null>;
    set(pathname: string, data: CachedFetchValue | null, ctx: SetIncrementalFetchCacheContext): Promise<void>;
    set(pathname: string, data: Exclude<IncrementalCacheValue, CachedFetchValue> | null, ctx: SetIncrementalResponseCacheContext | SetIncrementalImageCacheContext): Promise<void>;
}
