import type { FlightRouterState, InitialRSCPayload, NavigationFlightResponse } from '../../../shared/lib/app-router-types';
import { type NEXT_ROUTER_PREFETCH_HEADER, type NEXT_ROUTER_SEGMENT_PREFETCH_HEADER, NEXT_ROUTER_STATE_TREE_HEADER, NEXT_URL, RSC_HEADER, NEXT_HMR_REFRESH_HEADER, NEXT_HTML_REQUEST_ID_HEADER, NEXT_REQUEST_ID_HEADER } from '../app-router-headers';
import type { PartialTransportData } from '../../../shared/lib/rsc-transport';
import type { NormalizedSearch } from '../segment-cache/cache-key';
export interface FetchServerResponseOptions {
    readonly flightRouterState: FlightRouterState;
    readonly nextUrl: string | null;
    readonly isHmrRefresh?: boolean;
    readonly signal?: AbortSignal;
}
type SpaFetchServerResponseResult = {
    transportData: PartialTransportData | null;
    canonicalUrl: URL;
    renderedSearch: NormalizedSearch;
    couldBeIntercepted: boolean;
    supportsPerSegmentPrefetching: boolean;
    postponed: boolean;
    dynamicStaleTime: number;
    /**
     * Whether the response body was marked partial (contains unresolved
     * dynamic holes), read from the leading isPartial byte. Always false when
     * Cache Components is disabled. When `staticStageResponse` is non-null,
     * this is also its partiality: a complete response is cached whole, a
     * partial response is cached as its truncated static-stage prefix.
     */
    isResponsePartial: boolean;
    staticStageResponse: NavigationFlightResponse | null;
    runtimePrefetchStream: ReadableStream<Uint8Array> | null;
    responseHeaders: Headers;
    debugInfo: Array<any> | null;
    /**
     * Dev only: resolves once the server has flushed the shell-stage content to
     * the stream (or earlier, on a cache miss). The navigation defers revealing
     * the response (resolving its deferred RSCs) until this settles, so React
     * doesn't render a boundary's children before their row has been decoded and
     * commit a premature Suspense fallback. `null` outside the streaming dev
     * render.
     */
    revealAfter: Promise<void> | null;
};
type MpaFetchServerResponseResult = string;
export type FetchServerResponseResult = MpaFetchServerResponseResult | SpaFetchServerResponseResult;
export type RequestHeaders = {
    [RSC_HEADER]?: '1';
    [NEXT_ROUTER_STATE_TREE_HEADER]?: string;
    [NEXT_URL]?: string;
    [NEXT_ROUTER_PREFETCH_HEADER]?: '1' | '2' | '3';
    [NEXT_ROUTER_SEGMENT_PREFETCH_HEADER]?: string;
    'x-deployment-id'?: string;
    [NEXT_HMR_REFRESH_HEADER]?: '1';
    'Next-Test-Fetch-Priority'?: RequestInit['priority'];
    [NEXT_HTML_REQUEST_ID_HEADER]?: string;
    [NEXT_REQUEST_ID_HEADER]?: string;
};
/**
 * Fetch the flight data for the provided url. Takes in the current router state
 * to decide what to render server-side.
 */
export declare function fetchServerResponse(url: URL, options: FetchServerResponseOptions): Promise<FetchServerResponseResult>;
export type RSCResponse<T> = {
    ok: boolean;
    redirected: boolean;
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
    status: number;
    url: string;
    flightResponsePromise: (Promise<T> & {
        _debugInfo?: Array<any>;
    }) | null;
    cacheData: Promise<FetchResponseCacheData | null>;
};
type FetchResponseCacheData = {
    isResponsePartial: boolean;
    staticBodyClone?: ReadableStream<Uint8Array>;
    shellBodyClone?: ReadableStream<Uint8Array>;
};
/**
 * Strips the leading isPartial byte from an RSC navigation response and
 * clones the body for segment cache extraction.
 *
 * When cache components is enabled, the server prepends a single byte:
 * '~' (0x7e) for partial, '#' (0x23) for complete. This must be stripped
 * before Flight decoding because it's not valid RSC data. The body is
 * cloned before Flight can consume it so the clone is available for later use.
 *
 * When cache components is disabled, returns the original response with
 * cacheData: null.
 */
export declare function processFetch(response: Response): Promise<{
    response: Response;
    cacheData: FetchResponseCacheData | null;
}>;
/**
 * Resolves the shell stage of a prerender response:
 *
 * - `a === undefined` (server didn't emit shell stage info) or no shell body
 *   clone: no shell exists — returns null.
 * - `a` resolves to `null`: the shell IS the main response — returns
 *   `flightResponse` itself (callers compare by reference).
 * - `a` resolves to a number: the shell is a strict prefix of the response —
 *   returns a separate Flight decode of the byte prefix.
 */
export declare function resolveShellStageResponse<T extends NavigationFlightResponse | InitialRSCPayload>(cacheData: FetchResponseCacheData, flightResponse: T, headers: RequestHeaders | undefined): Promise<T | null>;
/**
 * Truncates and buffers a Flight stream clone at the given byte boundary and
 * decodes the prefix as an optional Flight payload. Returns null if extraction
 * fails or the root does not resolve before the next task. The caller can still
 * use the full response.
 */
export declare function decodeStageUntilBoundary<T>(responseBodyClone: ReadableStream<Uint8Array>, byteLength: number, headers: RequestHeaders | undefined): Promise<T | null>;
/**
 * Decodes already-buffered Flight response bytes as a stage payload. A
 * "stage" is a prefix of the staged server render — see `RenderStage` in
 * packages/next/src/server/app-render/staged-rendering.ts. The
 * bytes are delivered to Flight as a single chunk so all rows are processed
 * synchronously in one call — required for the thenable-status reads that
 * scope a response's late-resolving metadata (vary params, isPartial, ...)
 * to this decode.
 */
export declare function decodeBufferedStage<T>(buffer: Uint8Array, headers: RequestHeaders | undefined): Promise<T>;
export declare function createFetch<T>(url: URL, headers: RequestHeaders, fetchPriority: 'auto' | 'high' | 'low' | null, shouldImmediatelyDecode: boolean, signal?: AbortSignal): Promise<RSCResponse<T>>;
export declare function createFromNextReadableStream<T>(flightStream: ReadableStream<Uint8Array>, requestHeaders: RequestHeaders | undefined, options?: {
    allowPartialStream?: boolean;
}): Promise<T>;
export {};
