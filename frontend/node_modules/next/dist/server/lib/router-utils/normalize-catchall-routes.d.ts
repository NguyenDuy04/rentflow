type AppPathNormalizer = {
    normalize(pathname: string): string;
};
export type NormalizeCatchAllRoutesOptions = {
    strictRouteMatching?: boolean;
    defaultAppPaths?: Iterable<string>;
};
export type IncompatibleParallelRouteSlots = {
    layoutPath: string;
    route: string;
    missingSlots: string[];
};
export type NormalizeCatchAllRoutesResult = {
    unmatchedAppPages: string[];
    incompatibleParallelRouteSlots: IncompatibleParallelRouteSlots[];
};
/**
 * This function will transform the appPaths in order to support catch-all routes and parallel routes.
 * It will traverse the appPaths, looking for catch-all routes and try to find parallel routes that could match
 * the catch-all. If it finds a match, it will add the catch-all to the parallel route's list of possible routes.
 *
 * @param appPaths The appPaths to transform
 * @returns Page app paths that are not present in any retained matcher and
 * incompatible static matchers found before they were pruned.
 */
export declare function normalizeCatchAllRoutes(appPaths: Record<string, string[]>, normalizer?: AppPathNormalizer, { strictRouteMatching, defaultAppPaths, }?: NormalizeCatchAllRoutesOptions): NormalizeCatchAllRoutesResult;
/**
 * Finds ordinary route matchers that cannot construct every slot owned by a
 * layout. Interception routes are partial updates and intentionally use
 * different matching semantics.
 */
export declare function findIncompatibleParallelRouteSlots(appPaths: Record<string, string[]>, defaultAppPaths?: Iterable<string>): IncompatibleParallelRouteSlots[];
export {};
