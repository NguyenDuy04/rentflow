import type { CacheNode, Segment } from '../../../shared/lib/app-router-types';
import type React from 'react';
import { type VaryParams } from '../../../shared/lib/segment-cache/vary-params-decoding';
import { type RSCResponse } from '../router-reducer/fetch-server-response';
import { type PrefetchTask, type PrefetchSubtaskResult } from './scheduler';
import { type VaryPath, type PartialVaryPath } from './vary-path';
import type { NormalizedPathname, NormalizedSearch, RouteCacheKey } from './cache-key';
import { EntryStatus, type CacheMap, type UnknownMapEntry } from './cache-map';
export { EntryStatus } from './cache-map';
import { type SegmentRequestKey } from '../../../shared/lib/segment-cache/segment-value-encoding';
import type { FlightRouterState, NavigationFlightResponse } from '../../../shared/lib/app-router-types';
import { FetchStrategy } from './types';
import { type KnownRoutePart } from './optimistic-routes';
/**
 * Ensures a minimum stale time of 30s to avoid issues where the server sends a too
 * short-lived stale time, which would prevent anything from being prefetched.
 */
export declare function getStaleTimeMs(staleTimeSeconds: number): number;
/**
 * The output of a single segment from an RSC server response, stored
 * directly on the RouteTree node it describes.
 *
 * `rsc` may be null: that means the response skipped this segment — it
 * acknowledged the position without rendering it (e.g. an ancestor of a
 * rendered subtree that the client is expected to already have). This is
 * distinct from the RouteTree node's `data` slot being null, which means
 * the response carried no information about the segment at all.
 */
export type RSCSegmentData = {
    rsc: React.ReactNode;
    /**
     * Whether anything in the segment's output is not fully resolved:
     * dynamic holes, runtime holes, anything suspended.
     * Resolved at the decode boundary from whichever signal is authoritative
     * for the response's wire form: the staged per-node encoding of
     * per-segment prefetch responses, or the response-level partiality for
     * boolean-form responses (see the `isPartial` derivation in
     * decodeTransportNode).
     *
     * This absolute definition holds for every settled cache entry too; the
     * one deliberate exception is a Pending Full entry, which pre-sets
     * `isPartial: false` before any data exists (see the Pending-Full
     * convention in upgradeToPendingSegment).
     */
    isPartial: boolean;
    /**
     * The source of the params this segment's output depends on (root params
     * included). Null means unknown — tracking wasn't enabled, or the decode
     * had no root params to union in — so consumers key on all params.
     */
    varyParams: VaryParams | null;
    /**
     * The segment's own staleTime in seconds, when the response carries one
     * (per-segment prefetch responses only — see TransportSegmentData['s']).
     * Null means the response-level staleness governs this segment.
     */
    staleTimeSeconds: number | null;
};
export type RouteTree<TData> = {
    requestKey: SegmentRequestKey;
    segment: Segment;
    varyPath: VaryPath;
    shellVaryPath: VaryPath;
    refreshState: RefreshState | null;
    data: TData;
    slots: null | Map<string, RouteTree<TData>>;
    prefetchHints: number;
};
export type RefreshState = {
    canonicalUrl: string;
    renderedSearch: NormalizedSearch;
};
export type RootRouteTree<TData> = {
    tree: RouteTree<TData>;
    head: RouteTree<TData>;
};
export declare function createRootRouteTree<TData>(tree: RouteTree<TData>, head: RouteTree<TData>): RootRouteTree<TData>;
export declare function doesRouteStructureMatch<TCurrent, TNext>(currentTree: RouteTree<TCurrent>, nextTree: RouteTree<TNext>): boolean;
type RouteCacheEntryShared = {
    couldBeIntercepted: boolean;
    predictedFrom: KnownRoutePart | null;
    ref: UnknownMapEntry | null;
    size: number;
    staleAt: number;
    version: number;
};
export type PendingRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Empty | EntryStatus.Pending;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    renderedSearch: null;
    root: null;
    supportsPerSegmentPrefetching: false;
};
type RejectedRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Rejected;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    renderedSearch: null;
    root: null;
    supportsPerSegmentPrefetching: boolean;
};
export type FulfilledRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    blockedTasks: null;
    canonicalUrl: string;
    renderedSearch: NormalizedSearch;
    root: RootRouteTree<null>;
    supportsPerSegmentPrefetching: boolean;
};
export type RouteCacheEntry = PendingRouteCacheEntry | FulfilledRouteCacheEntry | RejectedRouteCacheEntry;
type SegmentCacheEntryShared = {
    /**
     * The fetch strategy this entry's content EFFECTIVELY corresponds to,
     * which may be deeper than the strategy that requested it: an entry is
     * recorded at the tier of the payload that fully satisfied it (e.g. a
     * shell-spawned entry fulfilled by a response whose shell IS the full
     * response is recorded at the concrete tier — and keyed by it too: without
     * server vary evidence the entry is re-keyed to the concrete vary path
     * rather than parked in the shell slot; see the keying derivation in
     * writeSegmentDataIntoCache). Compared via
     * `canNewFetchStrategyProvideMoreContent` to decide whether a new request
     * could yield more content than what's already cached.
     *
     * "Effectively" spans both of the tier axes, static-vs-runtime included: a
     * static response that accessed no runtime data is as complete as a runtime
     * response of the same variant, so it records the RUNTIME tier (see
     * `recordedFetchStrategy` in writeSegmentDataIntoCache). That is what lets
     * "would a runtime request return more?" be answered by comparing tiers,
     * with no separate per-entry signal — the question the scheduler asks in
     * `wouldRuntimeRequestProvideMore`.
     */
    fetchStrategy: FetchStrategy;
    /**
     * True if this entry was fulfilled from a fallback shell response (the page
     * had not yet been prerendered with concrete params). The scheduler uses
     * this to retry the static prefetch, since a more complete version may
     * become available once the server's background regeneration finishes.
     *
     * Distinct from `isPartial`: a fully-prerendered PPR page can have partial
     * segments that should NOT be retried. See `NavigationFlightResponse['f']`.
     */
    isUpgradeableISRFallback: boolean;
    ref: UnknownMapEntry | null;
    size: number;
    staleAt: number;
    version: number;
};
export type EmptySegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Empty;
    blockedTasks: Set<PrefetchTask> | null;
    rsc: null;
    isPartial: true;
    promise: null;
};
export type PendingSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Pending;
    blockedTasks: Set<PrefetchTask> | null;
    rsc: null;
    isPartial: boolean;
    promise: null | PromiseWithResolvers<FulfilledSegmentCacheEntry | null>;
};
type RejectedSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Rejected;
    blockedTasks: Set<PrefetchTask> | null;
    rsc: null;
    isPartial: true;
    promise: null;
};
export type FulfilledSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    blockedTasks: null;
    rsc: React.ReactNode | null;
    isPartial: boolean;
    varyParams: VaryParams | null;
    promise: null;
};
export type SegmentCacheEntry = EmptySegmentCacheEntry | PendingSegmentCacheEntry | RejectedSegmentCacheEntry | FulfilledSegmentCacheEntry;
export type NonEmptySegmentCacheEntry = Exclude<SegmentCacheEntry, EmptySegmentCacheEntry>;
export declare const MetadataOnlyRequestTree: FlightRouterState;
/**
 * The shared segment cache map. Segment cache functions do not access this
 * ambiently — every unit of work is bound to a map when it is created, and
 * reads and writes receive that map explicitly:
 *
 * - A prefetch task captures its map when it is scheduled
 *   (`PrefetchTask.segmentCacheMap` in scheduler.ts). Almost always this one;
 *   a task scheduled while the Instant Navigation Testing lock is held gets
 *   the lock scope's private map instead (which starts empty and is discarded
 *   at release), so a locked navigation observes only data fetched under the
 *   lock — never a stale entry left in the shared cache by an earlier
 *   navigation, prefetch, or scope.
 * - A locked navigation inherits the map of the prefetch task that drives it
 *   (see `ensurePrefetchThenNavigate` in navigation.ts).
 * - Everything else — unlocked navigations, hydration, and router work that
 *   is not a captured navigation (refreshes, history-traversal restores,
 *   server-action redirects, server patches) — uses this shared map
 *   directly, even while a lock is held.
 *
 * Binding at creation means a task queued before a lock scope begins never
 * leaks entries into the scope's map (or reads out of it), and a scope task's
 * late responses never leak into the shared map.
 */
export declare const segmentCacheMap: CacheMap<SegmentCacheEntry>;
export declare function getCurrentRouteCacheVersion(): number;
export declare function getCurrentSegmentCacheVersion(): number;
/**
 * Invalidates all prefetch cache entries (both route and segment caches).
 *
 * After invalidation, triggers re-prefetching of visible links and notifies
 * invalidation listeners.
 */
export declare function invalidateEntirePrefetchCache(nextUrl: string | null, root: RootRouteTree<CacheNode>): void;
/**
 * Invalidates all route cache entries. Route entries contain the tree structure
 * (which segments exist at a given URL) but not the segment data itself.
 *
 * After invalidation, triggers re-prefetching of visible links and notifies
 * invalidation listeners.
 */
export declare function invalidateRouteCacheEntries(nextUrl: string | null, root: RootRouteTree<CacheNode>): void;
/**
 * Invalidates all segment cache entries. Segment entries contain the actual
 * RSC data for each segment.
 *
 * After invalidation, triggers re-prefetching of visible links and notifies
 * invalidation listeners.
 */
export declare function invalidateSegmentCacheEntries(nextUrl: string | null, root: RootRouteTree<CacheNode>): void;
export declare function pingInvalidationListeners(nextUrl: string | null, root: RootRouteTree<CacheNode>): void;
export declare function readRouteCacheEntry(now: number, key: RouteCacheKey): RouteCacheEntry | null;
/**
 * Reads the cache entry for a segment during a navigation. Unlike a plain
 * lookup, prefers a Fulfilled entry over a more-specific Pending or Rejected
 * entry: during a navigation, a less-specific shell entry (e.g. params ->
 * Fallback) should be rendered immediately rather than blocking on a
 * more-specific Pending entry that may still be in-flight.
 *
 * Performs up to two lookups:
 *  1. An `onlyMatchFulfilled` lookup that walks past Pending/Rejected entries
 *     at more-specific keypaths to find a Fulfilled fallback (e.g. a cached
 *     shell).
 *  2. If no Fulfilled entry is found, a regular lookup that returns the most
 *     specific match regardless of status.
 */
export declare function readSegmentCacheEntryForNavigation(now: number, map: CacheMap<SegmentCacheEntry>, varyPath: VaryPath, restrictToShell?: boolean): SegmentCacheEntry | null;
export declare function waitForSegmentCacheEntry(pendingEntry: PendingSegmentCacheEntry): Promise<FulfilledSegmentCacheEntry | null>;
/**
 * Checks if an entry for a route exists in the cache. If so, it returns the
 * entry, If not, it adds an empty entry to the cache and returns it.
 */
export declare function readOrCreateRouteCacheEntry(now: number, task: PrefetchTask, key: RouteCacheKey): RouteCacheEntry;
export declare function deprecated_requestOptimisticRouteCacheEntry(now: number, requestedUrl: URL, nextUrl: string | null): FulfilledRouteCacheEntry | null;
/**
 * Checks if an entry for a segment exists in the cache. If so, it returns the
 * entry, If not, it adds an empty entry to the cache and returns it.
 */
export declare function readOrCreateSegmentCacheEntry(now: number, map: CacheMap<SegmentCacheEntry>, fetchStrategy: FetchStrategy, tree: RouteTree<RSCSegmentData | null>): SegmentCacheEntry;
export declare function readOrCreateRevalidatingSegmentEntry(now: number, map: CacheMap<SegmentCacheEntry>, fetchStrategy: FetchStrategy, tree: RouteTree<RSCSegmentData | null>): SegmentCacheEntry;
export declare function overwriteRevalidatingSegmentCacheEntry(now: number, map: CacheMap<SegmentCacheEntry>, fetchStrategy: FetchStrategy, tree: RouteTree<RSCSegmentData | null>): EmptySegmentCacheEntry;
export declare function upsertSegmentEntry(now: number, map: CacheMap<SegmentCacheEntry>, varyPath: VaryPath, candidateEntry: SegmentCacheEntry, lookupVaryPath: VaryPath | null): SegmentCacheEntry | null;
export declare function createDetachedSegmentCacheEntry(now: number): EmptySegmentCacheEntry;
export declare function upgradeToPendingSegment(emptyEntry: EmptySegmentCacheEntry, fetchStrategy: FetchStrategy): PendingSegmentCacheEntry;
export declare function attemptToFulfillDynamicSegmentFromBFCache(now: number, segment: EmptySegmentCacheEntry, tree: RouteTree<RSCSegmentData | null>): FulfilledSegmentCacheEntry | null;
/**
 * Attempts to replace an existing segment cache entry with data from the
 * bfcache. Unlike `attemptToFulfillDynamicSegmentFromBFCache` (which fills an
 * empty entry), this creates a new entry and upserts it, so it works even when
 * the segment is already fulfilled.
 */
export declare function attemptToUpgradeSegmentFromBFCache(now: number, map: CacheMap<SegmentCacheEntry>, tree: RouteTree<RSCSegmentData | null>): FulfilledSegmentCacheEntry | null;
/**
 * The head's request key on the client. The server's own key for the head,
 * HEAD_REQUEST_KEY, carries no path information: there is only one head per
 * URL, so the server has no need to distinguish parallel pages. On the client
 * the request key is the head's cache identity and what doesRouteStructureMatch
 * compares, so the head takes its page's request key with HEAD_REQUEST_KEY
 * appended — the key the server would have assigned had the head been a
 * segment below the page — and two pages' heads never match. The head varies
 * on the same params as its page, so the rest of its vary path is the page's.
 * The page must be the route's own: a page in a slot retained from another
 * URL (one with a refresh state) belongs to that URL's head. When a route has
 * multiple parallel pages of its own, the first one is used; the keys only
 * differ in route groups and slot names, so any of them works as long as it
 * is always the same one.
 */
export declare function getHeadRequestKey(pageRequestKey: SegmentRequestKey): SegmentRequestKey;
export declare function createMetadataRouteTree<TData>(metadataVaryPath: VaryPath, rootPrefetchHints: number, data: TData): RouteTree<TData>;
export declare function fulfillRouteCacheEntry(now: number, entry: PendingRouteCacheEntry, root: RootRouteTree<RSCSegmentData | null>, couldBeIntercepted: boolean, canonicalUrl: string, renderedSearch: NormalizedSearch, supportsPerSegmentPrefetching: boolean): FulfilledRouteCacheEntry;
export declare function writeRouteIntoCache(now: number, pathname: NormalizedPathname, search: NormalizedSearch, nextUrl: string | null, root: RootRouteTree<RSCSegmentData | null>, couldBeIntercepted: boolean, canonicalUrl: string, renderedSearch: NormalizedSearch, supportsPerSegmentPrefetching: boolean): FulfilledRouteCacheEntry;
export type RouteTreeAccumulator = {
    metadataVaryPath: VaryPath | null;
    treeDivergedFromBase: boolean;
};
export declare function convertRootFlightRouterStateToRouteTree(flightRouterState: FlightRouterState, renderedSearch: NormalizedSearch, acc: RouteTreeAccumulator): RouteTree<null>;
export declare function rebaseInactiveRouteTree<TData>(treeToRebase: RouteTree<TData>): RouteTree<null>;
export declare function convertFlightRouterStateToRouteTree(flightRouterState: FlightRouterState, requestKey: SegmentRequestKey, parentPartialVaryPath: PartialVaryPath | null, parentRenderedSearch: NormalizedSearch, acc: RouteTreeAccumulator): RouteTree<null>;
export declare function convertRouteTreeToFlightRouterState<TData>(routeTree: RouteTree<TData>): FlightRouterState;
export declare function fetchRouteOnCacheMiss(entry: PendingRouteCacheEntry, key: RouteCacheKey): Promise<PrefetchSubtaskResult<null> | null>;
export declare function fetchSegmentPrefetchesUsingStaticRequest(task: PrefetchTask, route: FulfilledRouteCacheEntry, routeKey: RouteCacheKey, tree: RouteTree<RSCSegmentData | null>, spawnedEntries: Map<SegmentRequestKey, PendingSegmentCacheEntry>, fetchStrategy: FetchStrategy.PPR | FetchStrategy.StaticShell): Promise<PrefetchSubtaskResult<null> | null>;
export declare function fetchSegmentPrefetchesUsingRuntimeRequest(task: PrefetchTask, route: FulfilledRouteCacheEntry, fetchStrategy: FetchStrategy.LoadingBoundary | FetchStrategy.PPRRuntime | FetchStrategy.RuntimeShell | FetchStrategy.Full, requestTree: FlightRouterState, spawnedEntries: Map<SegmentRequestKey, PendingSegmentCacheEntry>): Promise<PrefetchSubtaskResult<null> | null>;
/**
 * Reads a prefetch response body to completion — optionally truncating at
 * `byteLimit` — and returns the bytes as a single contiguous buffer.
 *
 * Buffering the entire response before passing it to the Flight client
 * ensures that when Flight processes the stream, all model data is available
 * synchronously. This is what makes the decode boundary's thenable-status
 * reads (vary params, isPartial, staleTime — see decode-server-response)
 * sound: if data arrived in multiple network chunks, the thenables might not
 * yet be fulfilled. (`decodeBufferedStage` performs the matching
 * single-chunk decode.)
 *
 * TODO: There are too many intermediate stream transformations in the
 * prefetch response pipeline (e.g. stripIsPartialByte, this function).
 * These could all be consolidated into a single transformation. Refactor
 * once the cached navigations experiment lands.
 */
export declare function bufferPrefetchResponseBody(body: ReadableStream<Uint8Array>, byteLimit?: number): Promise<Uint8Array>;
/**
 * Checks whether the new fetch strategy is likely to provide more content than the old one.
 *
 * Generally, when an app uses dynamic data, a "more specific" fetch strategy is expected to provide more content:
 * - `LoadingBoundary` only provides static layouts
 * - `StaticShell` provides the shell-stage variant extracted from a static response —
 *   param-dependent content reduced to pending fallbacks, and never any content that
 *   depends on session data (cookies, headers)
 * - `RuntimeShell` provides the shell stage rendered by a runtime request, which can
 *   additionally include shell-stage content that depends on session data
 * - `PPR` can provide static shells for each segment, including prerendered param-dependent
 *   content at concrete paths (excluding dynamic data)
 * - `PPRRuntime` can additionally include content that uses searchParams, params, or cookies
 * - `Full` includes all the content, even if it uses dynamic data
 *
 * However, it's possible that a more specific fetch strategy *won't* give us more content if:
 * - a segment is fully static
 *   (then, `PPR`/`PPRRuntime`/`Full` will all yield equivalent results)
 * - providing searchParams/params/cookies doesn't reveal any more content, e.g. because of an `await connection()`
 *   (then, `PPR` and `PPRRuntime` will yield equivalent results, only `Full` will give us more)
 * Because of this, when comparing two segments, we should also check if the existing segment is partial.
 * If it's not partial, then there's no need to prefetch it again, even using a "more specific" strategy.
 * There's currently no way to know if `PPRRuntime` will yield more data that `PPR`, so we have to assume it will.
 *
 * Also note that, in practice, we don't expect to be comparing `LoadingBoundary` to `PPR`/`PPRRuntime`,
 * because a non-PPR-enabled route wouldn't ever use the latter strategies. It might however use `Full`.
 */
export declare function canNewFetchStrategyProvideMoreContent(currentStrategy: FetchStrategy, newStrategy: FetchStrategy): boolean;
/**
 * Reads a stale-at time by `await`ing the staleTime async iterable (last
 * yielded value wins) and, if a `response` is given and the iterable yields
 * nothing, falling back to the `Next-Router-Stale-Time` header.
 *
 * The async form is required for the two things `readFulfilledStaleAt` can't
 * do: the header fallback, and reading a dynamic `Full` response
 * (fetchStrategy.Full with Partial Prefetching disabled) — the one response
 * kind that isn't buffered before it's read, so its iterable values must be
 * awaited rather than drained synchronously off their thenable status.
 *
 * Buffered responses (static PPR, runtime prefetch, stage decodes) don't need
 * the async form: segment bundles and the shell-stage decode already read
 * staleTime synchronously via `readFulfilledStaleAt`, and the remaining
 * buffered callers here could be moved to it too.
 */
export declare function resolveStaleAt(now: number, staleTimeIterable: AsyncIterable<number> | undefined, response?: RSCResponse<unknown>): Promise<number>;
/**
 * Fire-and-forget ("spawn"), unlike the synchronous cache-write family it
 * wraps (writeServerResponseIntoCache and below): the stage's staleTime must
 * be resolved asynchronously from the response's own `s` field before the
 * write can happen, and failures are swallowed — a failed cache write is not
 * fatal to the render that produced the response.
 *
 * Writes the static stage of a navigation response — or of the initial RSC
 * payload — into the segment cache, so subsequent navigations can serve
 * cached static segments instantly.
 */
export declare function spawnStaticStageCacheWrite(now: number, response: NavigationFlightResponse, isResponsePartial: boolean, responseHeaders: Headers | null, baseTree: FlightRouterState, renderedSearch: string, map: CacheMap<SegmentCacheEntry>): void;
/**
 * Decodes an embedded runtime prefetch Flight stream and writes it into the
 * segment cache, so subsequent navigations can serve runtime-prefetchable
 * content from cache without a separate prefetch request.
 *
 * The stream is buffered before it's decoded, like every prefetch response
 * that carries cache metadata: the shell byte offset (`a`) and staleTime are
 * read synchronously off their thenable status, and extracting a distinct
 * shell stage requires re-decoding a truncated copy of the same bytes. The
 * writes go through the shared payload-pair orchestration
 * (writeResponsePayloadsIntoCache): the full payload is written at
 * PPRRuntime and a distinct shell stage at the shell tier (RuntimeShell),
 * like any other runtime prefetch response. This flow owns no pending
 * entries, so every write is a detached upsert.
 */
export declare function writeRuntimePrefetchStreamIntoCache(now: number, runtimePrefetchStream: ReadableStream<Uint8Array>, baseTree: FlightRouterState, renderedSearch: string, map: CacheMap<SegmentCacheEntry>): Promise<void>;
/**
 * Strips the leading isPartial byte from an RSC response stream.
 *
 * The server prepends a single byte: '~' (0x7e) for partial, '#' (0x23) for
 * complete. These bytes cannot appear as the first byte of a valid RSC Flight
 * response (Flight rows start with a hex digit or ':').
 *
 * If the first byte is not a recognized marker, the stream is returned intact
 * and `isPartial` is determined by the cachedNavigations experimental flag.
 */
export declare function stripIsPartialByte(stream: ReadableStream<Uint8Array>): Promise<{
    stream: ReadableStream<Uint8Array>;
    isPartial: boolean;
}>;
