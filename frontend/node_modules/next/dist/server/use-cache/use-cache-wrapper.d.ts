import type { CacheEntry } from '../lib/cache-handlers/types';
import { type SearchParams } from '../request/search-params';
import type { Params } from '../request/params';
import { FALLBACK_PARAMS, RUNTIME_DATA, SESSION_DATA } from '../resume-data-cache/cache-store';
export type CacheKeyParts = [
    id: string,
    args: unknown[],
    implementationHash: unknown
];
export interface UseCachePageProps {
    params: Promise<Params>;
    searchParams: Promise<SearchParams>;
    $$isPage: true;
}
export type UseCacheLayoutProps = {
    params: Promise<Params>;
    $$isLayout: true;
} & {
    [slot: string]: any;
};
/**
 * Cache entry metadata for propagation. Separated from the stream to make
 * ownership clear: metadata is freely shareable, streams must be explicitly
 * tee'd for each consumer.
 */
interface CacheResultMetadata {
    readonly tags: string[];
    readonly revalidate: number;
    readonly expire: number;
    readonly stale: number;
    readonly timestamp: number;
    readonly readRootParamNames: ReadonlySet<string> | undefined;
    readonly hasExplicitRevalidate: boolean | undefined;
    readonly hasExplicitExpire: boolean | undefined;
    readonly dynamicNestedCacheError: Error | undefined;
}
/**
 * Encapsulates a pending cache invocation for deduping. Manages lazy stream
 * tee-ing (via fork()) and metadata access for both intra-request and
 * cross-request joiners.
 */
declare class SharedCacheEntry {
    private stream;
    /**
     * Resolves when collection finishes, without waiting for handler writes.
     */
    readonly pendingMetadata: Promise<CacheResultMetadata>;
    /**
     * Resolves with collected metadata after any handler writes settle. Write
     * failures do not discard the metadata. Collection failures still reject this
     * promise.
     */
    readonly pendingCompletion: Promise<CacheResultMetadata>;
    constructor(stream: ReadableStream<Uint8Array>, pendingMetadata: Promise<CacheResultMetadata>, pendingWrite: Promise<void> | undefined);
    /**
     * Tee the stream: returns a copy for the caller, replaces the internal stream
     * with the remaining branch for future callers. Both the leader and joiners
     * call this — everyone gets a fork.
     */
    fork(): ReadableStream<Uint8Array>;
}
export type SharedCacheResult = {
    readonly type: 'cached';
    readonly entry: SharedCacheEntry;
} | {
    readonly type: 'prerender-dynamic';
    readonly reason: typeof FALLBACK_PARAMS | typeof RUNTIME_DATA | typeof SESSION_DATA;
    readonly hangingPromise: Promise<never>;
};
export interface CollectedCacheResult {
    entry: CacheEntry;
    /**
     * Whether the revalidate value was explicitly set via `cacheLife()`.
     * - `true`: explicitly set
     * - `false`: implicit (propagated from a nested cache or implicitly using the
     *   default profile)
     * - `undefined`: unknown (e.g. pre-existing entry from a cache handler)
     */
    hasExplicitRevalidate: boolean | undefined;
    /**
     * Whether the expire value was explicitly set via `cacheLife()`.
     * - `true`: explicitly set
     * - `false`: implicit (propagated from a nested cache or implicitly using the
     *   default profile)
     * - `undefined`: unknown (e.g. pre-existing entry from a cache handler)
     */
    hasExplicitExpire: boolean | undefined;
    /**
     * The root param names that were read during cache entry generation.
     * Used to compute the specific cache key after generation completes.
     * `undefined` for pre-existing entries from cache handlers where we
     * don't have this information.
     */
    readRootParamNames: ReadonlySet<string> | undefined;
    /**
     * The `Error` carried up from the first nested public `'use cache'`
     * invocation that propagated a dynamic cache life into this entry, captured
     * eagerly at that inner invocation's `cache()` entry. Used as `cause` for the
     * nested-dynamic cache error so the redbox can point at the inner invocation
     * site, not just the outer one. Lives in-memory only — intentionally dropped
     * from the serialized RDC because dynamic entries aren't serialized either.
     */
    dynamicNestedCacheError: Error | undefined;
}
export declare function cache(kind: string, id: string, boundArgsLength: number, originalFn: (...args: unknown[]) => Promise<unknown>, args: unknown[]): Promise<unknown>;
export {};
