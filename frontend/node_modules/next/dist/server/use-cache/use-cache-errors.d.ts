export declare class UseCacheTimeoutError extends Error {
    constructor(route: string);
}
export declare class UseCacheDeadlockError extends Error {
    constructor(route: string);
}
/**
 * Used purely as `cause` for the nested-dynamic cache error: its captured stack
 * points at the inner `"use cache"` invocation that propagated a dynamic cache
 * life up to the outer cache. Constructed eagerly in `cache()` while the caller
 * is still on the synchronous stack — see use-cache-wrapper.ts.
 */
export declare class NestedDynamicUseCacheError extends Error {
    constructor();
}
/** Exported separately because tests assert on it */
export declare const UNEXPECTED_CACHE_MISS_MESSAGE = "Unexpected cache miss after cache warming phase during prerendering. This is likely caused by non-deterministic arguments that differ between the cache warming phase and the final prerender phase (e.g. unstable array order). Ensure that arguments passed to cached functions are deterministic.";
export declare class UnexpectedCacheMissError extends Error {
    constructor(route: string);
}
