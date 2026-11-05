import type { FlightRouterState, PrefetchHints, HeadData } from '../../shared/lib/app-router-types';
import type { PartialTransportNode } from '../../shared/lib/rsc-transport';
import type { PreloadCallbacks } from './types';
import type { LoaderTree } from '../lib/app-dir-module';
import type { AppRenderContext } from './app-render';
/**
 * The result of rendering a navigation (or refresh/action) response: the
 * transport tree, plus the head (viewport/metadata). The head is returned
 * separately rather than as part of a TransportSegmentData because its vary
 * params are accumulated during the render; the caller assembles the
 * response-level head field once the walk has completed.
 */
export type NavigationResponseTree = {
    tree: PartialTransportNode;
    head: HeadData;
    isHeadPartial: boolean;
};
/**
 * Use router state to decide at what common layout to render the page.
 * This can either be the common layout between two pages or a specific place to start rendering from using the "refetch" marker in the tree.
 *
 * Returns the response's transport tree, anchored at the segment this walk
 * started from, or null when nothing below this segment produced output (the
 * response carries no information about this position).
 */
export declare function walkTreeWithFlightRouterState({ loaderTreeToFilter, parentParams, flightRouterState, parentIsInsideSharedLayout, rscHead, injectedCSS, injectedJS, injectedFontPreloadTags, rootLayoutIncluded, ctx, preloadCallbacks, MetadataOutlet, hintTree, }: {
    loaderTreeToFilter: LoaderTree;
    parentParams: {
        [key: string]: string | string[];
    };
    flightRouterState?: FlightRouterState;
    rscHead: HeadData;
    parentIsInsideSharedLayout?: boolean;
    injectedCSS: Set<string>;
    injectedJS: Set<string>;
    injectedFontPreloadTags: Set<string>;
    rootLayoutIncluded: boolean;
    ctx: AppRenderContext;
    preloadCallbacks: PreloadCallbacks;
    MetadataOutlet: React.ComponentType<{
        tree: LoaderTree;
    }>;
    hintTree: PrefetchHints | null;
}): Promise<NavigationResponseTree | null>;
/**
 * A simplified version of `walkTreeWithFlightRouterState` that doesn't skip
 * any layouts but returns a result of the same shape.
 * Intended to be used for instant validation, where we need the complete tree.
 */
export declare function createFullTreeForNavigation({ loaderTree, rscHead, injectedCSS, injectedJS, injectedFontPreloadTags, ctx, preloadCallbacks, MetadataOutlet, }: {
    loaderTree: LoaderTree;
    flightRouterState?: FlightRouterState;
    rscHead: HeadData;
    injectedCSS: Set<string>;
    injectedJS: Set<string>;
    injectedFontPreloadTags: Set<string>;
    ctx: AppRenderContext;
    preloadCallbacks: PreloadCallbacks;
    MetadataOutlet: React.ComponentType<{
        tree: LoaderTree;
    }>;
}): Promise<NavigationResponseTree>;
