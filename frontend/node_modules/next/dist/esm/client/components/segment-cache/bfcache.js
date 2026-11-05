import { DYNAMIC_STALETIME_MS } from '../router-reducer/reducers/navigate-reducer';
/**
 * Sentinel value indicating that no per-page dynamic stale time was provided.
 * When this is the dynamicStaleTime, the default DYNAMIC_STALETIME_MS is used.
 */ export const UnknownDynamicStaleTime = -1;
/**
 * Converts a dynamic stale time (in seconds, as sent by the server in the `d`
 * field of the Flight response) to an absolute staleAt timestamp. When the
 * value is unknown, falls back to the global DYNAMIC_STALETIME_MS.
 */ export function computeDynamicStaleAt(now, dynamicStaleTimeSeconds) {
    return dynamicStaleTimeSeconds !== UnknownDynamicStaleTime ? now + dynamicStaleTimeSeconds * 1000 : now + DYNAMIC_STALETIME_MS;
}
import { setInCacheMap, getFromCacheMap, EntryStatus, createCacheMap } from './cache-map';
const bfcacheMap = createCacheMap();
let currentBfCacheVersion = 0;
export function invalidateBfCache() {
    if (typeof window === 'undefined') {
        return;
    }
    currentBfCacheVersion++;
}
export function writeToBFCache(now, varyPath, cacheNode, dynamicStaleAt) {
    if (typeof window === 'undefined') {
        return;
    }
    const entry = {
        rsc: cacheNode.rsc,
        prefetchRsc: cacheNode.prefetchRsc,
        varyParams: cacheNode.varyParams,
        bfcacheId: cacheNode.bfcacheId,
        ref: null,
        // TODO: This is just a heuristic. Getting the actual size of the segment
        // isn't feasible because it's part of a larger streaming response. The
        // LRU will still evict it, we just won't have a fully accurate total
        // LRU size. However, we'll probably remove the size tracking from the LRU
        // entirely and use memory pressure events instead.
        size: 100,
        navigatedAt: now,
        // A back/forward navigation will disregard the stale time. This field is
        // only relevant when staleTimes.dynamic is enabled or unstable_dynamicStaleTime
        // is exported by a page.
        staleAt: dynamicStaleAt,
        version: currentBfCacheVersion,
        status: EntryStatus.Fulfilled
    };
    const isRevalidation = false;
    setInCacheMap(bfcacheMap, varyPath, entry, isRevalidation);
}
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
 */ export function updateBFCacheEntryFromDynamicResponse(varyPath, cacheNode, newStaleAt) {
    if (typeof window === 'undefined') {
        return;
    }
    const isRevalidation = false;
    // Read with staleness bypass (-1) so we can update even stale entries
    const entry = getFromCacheMap(-1, currentBfCacheVersion, bfcacheMap, varyPath, isRevalidation, false);
    if (entry !== null && entry.rsc === cacheNode.rsc) {
        entry.staleAt = newStaleAt;
        entry.varyParams = cacheNode.varyParams;
    }
}
export function readFromBFCache(varyPath) {
    if (typeof window === 'undefined') {
        return null;
    }
    const isRevalidation = false;
    return getFromCacheMap(// During a back/forward navigation, it doesn't matter how stale the data
    // might be. Pass -1 instead of the actual current time to bypass
    // staleness checks.
    -1, currentBfCacheVersion, bfcacheMap, varyPath, isRevalidation, false);
}
export function readFromBFCacheDuringRegularNavigation(now, varyPath) {
    if (typeof window === 'undefined') {
        return null;
    }
    const isRevalidation = false;
    return getFromCacheMap(now, currentBfCacheVersion, bfcacheMap, varyPath, isRevalidation, false);
}

//# sourceMappingURL=bfcache.js.map