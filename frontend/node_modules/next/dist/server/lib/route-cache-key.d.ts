import type { RouteDefinition } from '../route-definitions/route-definition';
import type { DynamicPrerenderManifestRoute, PrerenderManifestRoute } from '../../build';
import { RouteKind } from '../route-kind';
export declare const ROUTE_CACHE_DIRECTORY = "route-cache";
export type ResponseCacheOwner = {
    readonly kind: RouteKind;
    /** Canonical Pages pathname or full App module name, including groups and slots. */
    readonly sourceRoute: string;
};
/** Convert a runtime route definition to the identity used by response caches. */
export declare function getResponseCacheOwner(definition: Pick<RouteDefinition, 'kind' | 'page' | 'pathname'>): ResponseCacheOwner;
/**
 * Prerender metadata already identifies its source route. Compare that source
 * with the selected module before using its metadata, including negative
 * entries and partially specialized fallback shells. Cache storage continues
 * to use the full module identity, including groups and parallel slots.
 */
export declare function isRouteCacheOwner(pathname: string, owner: ResponseCacheOwner, prerender: Pick<PrerenderManifestRoute, 'srcRoute' | 'dataRoute'> | Pick<DynamicPrerenderManifestRoute, 'fallbackSourceRoute' | 'dataRoute'> | undefined, locales?: readonly string[]): boolean;
/**
 * Response keys are opaque to cache handlers. Hash the source route into one
 * fixed-length directory, preserving App groups and slots without expanding
 * Unicode names or repeating the source directory hierarchy on disk. The
 * pathname stays readable and is normalized exactly once before namespacing.
 */
export declare function getRouteCacheKey(pathname: string, owner: ResponseCacheOwner): string;
