import type { CacheNode } from '../../../shared/lib/app-router-types';
import type { VaryParams } from '../../../shared/lib/segment-cache/vary-params-decoding';
import type { VaryPath } from './vary-path';
/**
 * Sentinel value indicating that no per-page dynamic stale time was provided.
 * When this is the dynamicStaleTime, the default DYNAMIC_STALETIME_MS is used.
 */
export declare const UnknownDynamicStaleTime = -1;
/**
 * Converts a dynamic stale time (in seconds, as sent by the server in the `d`
 * field of the Flight response) to an absolute staleAt timestamp. When the
 * value is unknown, falls back to the global DYNAMIC_STALETIME_MS.
 */
export declare function computeDynamicStaleAt(now: number, dynamicStaleTimeSeconds: number): number;
import { EntryStatus, type UnknownMapEntry } from './cache-map';
export type BFCacheEntry = {
    rsc: React.ReactNode | null;
    prefetchRsc: React.ReactNode | null;
    varyParams: VaryParams | null;
    bfcacheId: number;
    ref: UnknownMapEntry | null;
    size: number;
    navigatedAt: number;
    staleAt: number;
    version: number;
    status: EntryStatus.Fulfilled;
};
export declare function invalidateBfCache(): void;
export declare function writeToBFCache(now: number, varyPath: VaryPath, cacheNode: CacheNode, dynamicStaleAt: number): void;
/**
 * Patches the entry written for a segment before its dynamic response
 * arrived, with what the response filled in on the segment's CacheNode: the
 * per-page stale time from `unstable_dynamicStaleTime` (authoritative over
 * the default DYNAMIC_STALETIME_MS the entry was written with) and the
 * source of the params its data depends on. The entry shares the node's
 * deferred `rsc` promise, which the response resolves in place. Only the entry
 * that shares the node's `rsc` is updated; a refresh may have replaced the
 * entry at the same vary path, and that entry belongs to the newer node.
 *
 * TODO: This function exists because the entry gets `rsc` when it is written
 * but the stale time and vary params only later, through a second write that
 * has to find the entry again. The response should fill in all three as one
 * unit: make the pending CacheNode itself the thenable (like DeferredRsc, but
 * for the whole node) with an explicit pending → fulfilled/rejected
 * transition, so the entry holds the node and observes its resolution
 * directly, with nothing to look up or patch afterwards.
 */
export declare function updateBFCacheEntryFromDynamicResponse(varyPath: VaryPath, cacheNode: CacheNode, newStaleAt: number): void;
export declare function readFromBFCache(varyPath: VaryPath): BFCacheEntry | null;
export declare function readFromBFCacheDuringRegularNavigation(now: number, varyPath: VaryPath): BFCacheEntry | null;
