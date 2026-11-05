/**
 * Optimistic Routing (Known Routes)
 *
 * This module enables the client to predict route structure for URLs that
 * haven't been prefetched yet, based on previously learned route patterns.
 * When successful, this allows skipping the route tree prefetch request
 * entirely.
 *
 * The core idea is that many URLs map to the same route structure. For example,
 * /blog/post-1 and /blog/post-2 both resolve to /blog/[slug]. Once we've
 * prefetched one, we can predict the structure of the other.
 *
 * However, we can't always make this prediction. Static siblings (like
 * /blog/featured alongside /blog/[slug]) have different route structures.
 * When we learn a dynamic route, we also learn its static siblings so we
 * know when NOT to apply the prediction.
 *
 * Main entry points:
 *
 * 1. discoverKnownRoute: Called after receiving a route tree from the server.
 *    Traverses the route tree, compares URL parts to segments, and populates
 *    the known route tree if they match. Routes are always inserted into the
 *    cache.
 *
 * 2. matchKnownRoute: Called when looking up a route with no cache entry.
 *    Matches the candidate URL against learned patterns. Returns a synthetic
 *    cache entry if successful, or null to fall back to server resolution.
 *
 * Rewrite detection happens during traversal: if a URL path part doesn't match
 * the corresponding route segment, we stop populating the known route tree
 * (since the mapping is incorrect) but still insert the route into the cache.
 *
 * The known route tree is append-only with no eviction. Route patterns are
 * derived from the filesystem, so they don't become stale within a session.
 * Cache invalidation on deploy clears everything anyway.
 *
 * Current limitations (deopt to server resolution):
 * - Rewrites: Detected during traversal (tree not populated, but route cached)
 * - Intercepted routes: The route tree varies by referrer (Next-Url header),
 *   so we can't predict the correct structure from the URL alone. Patterns are
 *   still stored during discovery (so the trie stays populated for non-
 *   intercepted siblings), but matching bails out when the pattern is marked
 *   as interceptable.
 */
import type { DynamicParamTypesShort } from '../../../shared/lib/app-router-types';
import type { RootRouteTree, RSCSegmentData, FulfilledRouteCacheEntry } from './cache';
import { type PendingRouteCacheEntry } from './cache';
import type { NormalizedSearch } from './cache-key';
/**
 * The known route tree is analogous to a route table. A different routing
 * implementation might use regexes or URLPattern; ours uses a trie indexed
 * by URL path segments.
 *
 * Each node (KnownRoutePart) represents a position in the URL and can have:
 * - staticChildren: Map of literal segments to child nodes
 * - dynamicChild: A single dynamic segment node ([slug], [...params], etc.)
 * - pattern: A cache entry template for routes that terminate here
 *
 * This tree only contains segments that correspond to actual filesystem routes.
 * Route groups like (marketing) and parallel routes like @modal are not
 * included since they don't appear in URLs. Similarly, if a URL is rewritten
 * to a different filesystem path, the original URL segments don't appear here
 * — only the resolved filesystem route structure is stored.
 *
 * Example tree after learning /blog/[slug], /blog/featured, and /about:
 *
 *   ├── about
 *   └── blog
 *       ├── featured
 *       └── [slug]
 *
 * When matching /blog/hello:
 *   1. "blog" matches static child
 *   2. "hello" doesn't match "featured", falls through to [slug]
 *   3. Returns [slug]'s pattern with resolved param { slug: "hello" }
 */
type KnownRoutePartBase = {
    staticChildren: Map<string, KnownRoutePart> | null;
    pattern: FulfilledRouteCacheEntry | null;
    hasConflictingDynamicChildren: boolean;
    hasDynamicRewrite: boolean;
};
type KnownRoutePartWithoutDynamicChild = KnownRoutePartBase & {
    dynamicChild: null;
    dynamicChildParamName: null;
    dynamicChildParamType: null;
};
type KnownRoutePartWithDynamicChild = KnownRoutePartBase & {
    dynamicChild: KnownRoutePart;
    dynamicChildParamName: string;
    dynamicChildParamType: DynamicParamTypesShort;
};
export type KnownRoutePart = KnownRoutePartWithoutDynamicChild | KnownRoutePartWithDynamicChild;
/**
 * Learns a route pattern from a server response and inserts it into the cache.
 *
 * Called after receiving a route tree from the server (initial load, navigation,
 * or prefetch). Traverses the route tree, compares URL parts to segments, and
 * populates the known route tree if they match. Routes are always inserted into
 * the cache regardless of whether the URL matches the route structure.
 *
 * When pendingEntry is provided, it's fulfilled and used. When null, an entry
 * is created and inserted into the route cache map.
 *
 * When hasDynamicRewrite is true, the node the route terminates at is marked
 * as having a dynamic rewrite, which prevents URLs of its shape from being
 * predicted. This is set when we detect a mismatch between what we predicted
 * and what the server returned.
 *
 * Returns the fulfilled route cache entry.
 */
export declare function discoverKnownRoute(now: number, pathname: string, search: NormalizedSearch, nextUrl: string | null, pendingEntry: PendingRouteCacheEntry | null, root: RootRouteTree<RSCSegmentData | null>, couldBeIntercepted: boolean, canonicalUrl: string, renderedSearch: NormalizedSearch, supportsPerSegmentPrefetching: boolean, hasDynamicRewrite: boolean): FulfilledRouteCacheEntry;
/**
 * Attempts to match a URL against learned route patterns.
 *
 * Returns a synthetic FulfilledRouteCacheEntry if the URL matches a known
 * pattern, or null if no match is found (fall back to server resolution).
 */
export declare function matchKnownRoute(now: number, pathname: string, search: NormalizedSearch): FulfilledRouteCacheEntry | null;
/**
 * Resets the known route tree. Called during development when routes may
 * change due to hot reloading.
 */
export declare function resetKnownRoutes(): void;
export {};
