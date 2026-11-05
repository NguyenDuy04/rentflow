export declare const INTERCEPTION_ROUTE_MARKERS: readonly ["(..)(..)", "(.)", "(..)", "(...)"];
export type InterceptionMarker = (typeof INTERCEPTION_ROUTE_MARKERS)[number];
export type MissingCanonicalInterceptionRoute = {
    interceptionRoute: string;
    canonicalRoute: string;
};
export declare function isInterceptionRouteAppPath(path: string): boolean;
type InterceptionRouteInformation = {
    /**
     * The intercepting route. This is the route that is being intercepted or the
     * route that the user was coming from. This is matched by the Next-Url
     * header.
     */
    interceptingRoute: string;
    /**
     * The intercepted route. This is the route that is being intercepted or the
     * route that the user is going to. This is matched by the request pathname.
     */
    interceptedRoute: string;
};
export declare function extractInterceptionRouteInformation(path: string): InterceptionRouteInformation;
/**
 * Finds interception matchers that cannot be loaded as an ordinary request.
 *
 * This must run after catch-all normalization and pruning so `appPaths`
 * contains the final matcher set rather than every possible matcher candidate.
 */
export declare function findMissingCanonicalInterceptionRoutes(appPaths: Record<string, string[]>): MissingCanonicalInterceptionRoute[];
export {};
