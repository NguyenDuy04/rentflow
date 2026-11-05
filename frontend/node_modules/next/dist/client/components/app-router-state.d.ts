import type { RootRouteTree } from './segment-cache/cache';
import type { FlightRouterState, ScrollRef } from '../../shared/lib/app-router-types';
import type { CacheNode } from '../../shared/lib/app-router-types';
import { FreshnessPolicy, type NavigationLock, type RootNavigationTask } from './render-tree';
import { type SegmentCacheEntry, type FulfilledRouteCacheEntry } from './segment-cache/cache';
import type { CacheMap } from './segment-cache/cache-map';
import type { AppRouterState } from './router-reducer/router-reducer-types';
import { ScrollBehavior } from './router-reducer/router-reducer-types';
import { type NavigationSeed } from './segment-cache/decode-server-response';
/**
 * Navigate to a new URL, using the Segment Cache to construct a response.
 *
 * To allow for synchronous navigations whenever possible, this is not an async
 * function. It returns a promise only if there's no matching prefetch in
 * the cache. Otherwise it returns an immediate result and uses Suspense/RSC to
 * stream in any missing data.
 */
export declare function navigate(state: AppRouterState, url: URL, currentUrl: URL, currentRenderedSearch: string, currentRoot: RootRouteTree<CacheNode>, currentFlightRouterState: FlightRouterState, nextUrl: string | null, freshnessPolicy: FreshnessPolicy, scrollBehavior: ScrollBehavior, navigateType: 'push' | 'replace'): AppRouterState | Promise<AppRouterState>;
export declare function navigateToKnownRoute(now: number, state: AppRouterState, url: URL, canonicalUrl: string, navigationSeed: NavigationSeed, currentUrl: URL, currentRenderedSearch: string, currentRoot: RootRouteTree<CacheNode>, freshnessPolicy: FreshnessPolicy, nextUrl: string | null, scrollBehavior: ScrollBehavior, navigateType: 'push' | 'replace', navigationLock: NavigationLock | null, map: CacheMap<SegmentCacheEntry>, debugInfo: Array<unknown> | null, routeCacheEntry: FulfilledRouteCacheEntry | null, signal: AbortSignal | undefined): AppRouterState;
export declare function completeHardNavigation(state: AppRouterState, url: URL, navigateType: 'push' | 'replace'): AppRouterState;
export declare function completeSoftNavigation(oldState: AppRouterState, url: URL, referringNextUrl: string | null, navigation: RootNavigationTask, renderedSearch: string, canonicalUrl: string, navigateType: 'push' | 'replace', scrollBehavior: ScrollBehavior, scrollRef: ScrollRef | null, collectedDebugInfo: Array<unknown> | null): AppRouterState;
export declare function completeTraverseNavigation(state: AppRouterState, url: URL, renderedSearch: string, navigation: RootNavigationTask, nextUrl: string | null): {
    canonicalUrl: string;
    renderedSearch: string;
    pushRef: {
        pendingPush: boolean;
        mpaNavigation: boolean;
        preserveCustomHistoryState: boolean;
    };
    scrollRef: import("./router-reducer/router-reducer-types").ScrollHandlerRef;
    root: RootRouteTree<CacheNode>;
    tree: FlightRouterState;
    nextUrl: string | null;
    previousNextUrl: null;
    debugInfo: null;
};
