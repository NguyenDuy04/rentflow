import type { IncomingHttpHeaders } from 'http';
import type { FlightRouterState } from '../../../shared/lib/app-router-types';
interface ParseRequestHeadersOptions {
    readonly isRoutePPREnabled: boolean;
    readonly previewModeId: string | undefined;
}
export interface ParsedRequestHeaders {
    /**
     * Router state provided from the client-side router. Used to handle rendering
     * from the common layout down. This value will be undefined if the request is
     * not a client-side navigation request, or if the request is a prefetch
     * request.
     */
    readonly flightRouterState: FlightRouterState | undefined;
    readonly isPrefetchRequest: boolean;
    readonly isRuntimePrefetchRequest: boolean;
    /**
     * App Shell prefetch: a runtime prefetch that the server renders with
     * params omitted (any `await params` hangs forever). Produces the
     * param-independent shell of the route. Implies isRuntimePrefetchRequest.
     */
    readonly isAppShellPrefetchRequest: boolean;
    readonly isRouteTreePrefetchRequest: boolean;
    readonly isHmrRefresh: boolean;
    readonly isRSCRequest: boolean;
    readonly nonce: string | undefined;
    readonly previouslyRevalidatedTags: string[];
    readonly requestId: string | undefined;
    readonly htmlRequestId: string | undefined;
}
export declare function parseRequestHeaders(headers: IncomingHttpHeaders, options: ParseRequestHeadersOptions): ParsedRequestHeaders;
export {};
