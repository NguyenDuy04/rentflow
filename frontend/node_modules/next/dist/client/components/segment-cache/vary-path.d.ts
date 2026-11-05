import { FetchStrategy } from './types';
import type { NormalizedPathname, NormalizedSearch, NormalizedNextUrl } from './cache-key';
import type { RouteTree } from './cache';
import { type FallbackType } from './cache-map';
import type { SegmentRequestKey } from '../../../shared/lib/segment-cache/segment-value-encoding';
import { SEARCH_PARAMS_VARY_ID, type VaryParamId, type VaryParams } from '../../../shared/lib/segment-cache/vary-params-decoding';
type Opaque<T, K> = T & {
    __brand: K;
};
/**
 * A linked-list of all the params (or other param-like) inputs that a cache
 * entry may vary by. This is used by the CacheMap module to reuse cache entries
 * across different param values. If a param has a value of Fallback, it means
 * the cache entry is reusable for all possible values of that param. See
 * cache-map.ts for details.
 *
 * A segment's vary path is a pure function of a segment's position in a
 * particular route tree and the (post-rewrite) URL that is being queried. More
 * concretely, successive queries of the cache for the same segment always use
 * the same vary path.
 *
 * A route's vary path is simpler: it's comprised of the pathname, search
 * string, and Next-URL header.
 */
export type VaryPathNode = {
    /**
     * Identifies which param this vary path node corresponds to. Used by
     * getFulfilledSegmentVaryPath to determine which params to replace with
     * Fallback based on the varyParams set from the server.
     *
     * - For path params: the param name (e.g., 'slug')
     * - For search params: SEARCH_PARAMS_VARY_ID
     * - For non-param nodes (request keys, etc.): null
     */
    id: VaryParamId | null;
    value: string | null | FallbackType;
    /**
     * Whether this node corresponds to a root param — a path param at or above
     * the application's root layout. Root params may appear in the App Shell, so
     * the shell vary path keeps their concrete value instead of replacing it with
     * Fallback. See getShellSegmentVaryPath. Only ever true on path param nodes;
     * false for structural and search param nodes.
     *
     * Always a boolean (never undefined) so that every VaryPathNode shares a
     * single hidden class, keeping the cache hot paths monomorphic.
     */
    isRootParam: boolean;
    parent: VaryPathNode | null;
};
export type RouteVaryPath = Opaque<{
    id: null;
    value: NormalizedPathname;
    isRootParam: false;
    parent: {
        id: typeof SEARCH_PARAMS_VARY_ID;
        value: NormalizedSearch;
        isRootParam: false;
        parent: {
            id: null;
            value: NormalizedNextUrl | null | FallbackType;
            isRootParam: false;
            parent: null;
        };
    };
}, 'RouteVaryPath'>;
export type VaryPath = Opaque<{
    id: null;
    value: SegmentRequestKey;
    isRootParam: false;
    parent: VaryPathNode | null;
}, 'VaryPath'>;
export type PartialVaryPath = Opaque<VaryPathNode, 'PartialVaryPath'>;
export declare function getRouteVaryPath(pathname: NormalizedPathname, search: NormalizedSearch, nextUrl: NormalizedNextUrl | null): RouteVaryPath;
export declare function getFulfilledRouteVaryPath(pathname: NormalizedPathname, search: NormalizedSearch, nextUrl: NormalizedNextUrl | null, couldBeIntercepted: boolean): RouteVaryPath;
export declare function appendLayoutVaryPath(parentPath: PartialVaryPath | null, cacheKey: string, paramName: string, isRootParam: boolean): PartialVaryPath;
export declare function finalizeVaryPath(requestKey: SegmentRequestKey, searchParams: NormalizedSearch | FallbackType | null, partialVaryPath: PartialVaryPath | null): VaryPath;
export declare function getPartialVaryPath(finalizedVaryPath: VaryPath): PartialVaryPath | null;
export declare function getSegmentVaryPathForRequest<TData>(fetchStrategy: FetchStrategy, tree: RouteTree<TData>): VaryPath;
export declare function cloneVaryPathWithNewSearchParams(originalVaryPath: VaryPath, newSearch: NormalizedSearch): VaryPath;
/**
 * Returns the rendered value of the vary path's search params entry when the
 * vary path has one with a concrete value, null otherwise. Only a segment that
 * varies on search params carries the entry; on every other vary path, and on
 * one whose search params entry is Fallback, this is null.
 */
export declare function getRenderedSearchFromVaryPath(varyPath: VaryPath): NormalizedSearch | null;
/**
 * The kind of param change between two vary paths for the same segment. A path
 * param change takes precedence, because path params are part of
 * LayoutRouter's React key: the segment remounts either way.
 */
export declare const enum ParamsChange {
    None = 0,
    SearchParams = 1,
    PathParam = 2
}
export declare function compareParams(currentVaryPath: VaryPath, nextVaryPath: VaryPath): ParamsChange;
export declare function didReadChangedParam(currentVaryPath: VaryPath, nextVaryPath: VaryPath, varyParams: VaryParams | null): boolean;
export declare function getFulfilledSegmentVaryPath(original: VaryPathNode, varyParams: Set<VaryParamId>): VaryPath;
export declare function getShellSegmentVaryPath(original: VaryPathNode): VaryPath;
export {};
