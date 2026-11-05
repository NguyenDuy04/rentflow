import { NEXT_HMR_REFRESH_HEADER, NEXT_ROUTER_PREFETCH_HEADER, NEXT_ROUTER_STATE_TREE_HEADER, RSC_HEADER, NEXT_ROUTER_SEGMENT_PREFETCH_HEADER, NEXT_REQUEST_ID_HEADER, NEXT_HTML_REQUEST_ID_HEADER } from '../../../client/components/app-router-headers';
import { isRSCRequestHeader } from '../../lib/is-rsc-request';
import { getScriptNonceFromHeaders } from '../../app-render/get-script-nonce-from-header';
import { parseAndValidateFlightRouterState } from '../../app-render/parse-and-validate-flight-router-state';
import { getPreviouslyRevalidatedTags } from '../../server-utils';
export function parseRequestHeaders(headers, options) {
    const isRSCRequest = isRSCRequestHeader(headers[RSC_HEADER]);
    // runtime prefetch requests are *not* treated as prefetch requests
    // (TODO: this is confusing, we should refactor this to express this better)
    const isPrefetchRequest = isRSCRequest && headers[NEXT_ROUTER_PREFETCH_HEADER] === '1';
    const isAppShellPrefetchRequest = isRSCRequest && headers[NEXT_ROUTER_PREFETCH_HEADER] === '3';
    // App Shell prefetches are a subtype of runtime prefetch — same code path,
    // but with less resolved content (omitting link data)
    const isRuntimePrefetchRequest = isRSCRequest && (headers[NEXT_ROUTER_PREFETCH_HEADER] === '2' || isAppShellPrefetchRequest);
    const isHmrRefresh = headers[NEXT_HMR_REFRESH_HEADER] !== undefined;
    const shouldProvideFlightRouterState = isRSCRequest && (!isPrefetchRequest || !options.isRoutePPREnabled);
    const flightRouterState = shouldProvideFlightRouterState ? parseAndValidateFlightRouterState(headers[NEXT_ROUTER_STATE_TREE_HEADER]) : undefined;
    // Checks if this is a prefetch of the Route Tree by the Segment Cache
    const isRouteTreePrefetchRequest = isRSCRequest && headers[NEXT_ROUTER_SEGMENT_PREFETCH_HEADER] === '/_tree';
    const nonce = getScriptNonceFromHeaders(headers);
    const previouslyRevalidatedTags = getPreviouslyRevalidatedTags(headers, options.previewModeId);
    let requestId;
    let htmlRequestId;
    if (process.env.__NEXT_DEV_SERVER) {
        // The request IDs are only used for the dev server to send debug
        // information to the matching client (identified by the HTML request ID
        // that was sent to the client with the HTML document) for the current
        // request (identified by the request ID, as defined by the client).
        requestId = typeof headers[NEXT_REQUEST_ID_HEADER] === 'string' ? headers[NEXT_REQUEST_ID_HEADER] : undefined;
        htmlRequestId = typeof headers[NEXT_HTML_REQUEST_ID_HEADER] === 'string' ? headers[NEXT_HTML_REQUEST_ID_HEADER] : undefined;
    }
    return {
        flightRouterState,
        isPrefetchRequest,
        isRuntimePrefetchRequest,
        isAppShellPrefetchRequest,
        isRouteTreePrefetchRequest,
        isHmrRefresh,
        isRSCRequest,
        nonce,
        previouslyRevalidatedTags,
        requestId,
        htmlRequestId
    };
}

//# sourceMappingURL=parse-request-headers.js.map