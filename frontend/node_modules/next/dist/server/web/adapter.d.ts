import type { RequestData, FetchEventResult } from './types';
import type { RequestInit } from './spec-extension/request';
import { NextFetchEvent } from './spec-extension/fetch-event';
import { NextRequest } from './spec-extension/request';
export declare class NextRequestHint extends NextRequest {
    sourcePage: string;
    fetchMetrics: FetchEventResult['fetchMetrics'] | undefined;
    constructor(params: {
        init: RequestInit;
        input: Request | string;
        page: string;
    });
    get request(): void;
    respondWith(): void;
    waitUntil(): void;
}
export type AdapterOptions = {
    handler: (req: NextRequestHint, event: NextFetchEvent) => Promise<Response>;
    page: string;
    request: RequestData;
    IncrementalCache?: typeof import('../lib/incremental-cache').IncrementalCache;
    incrementalCacheHandler?: typeof import('../lib/incremental-cache').CacheHandler;
    bypassNextUrl?: boolean;
    /**
     * When the Node.js middleware entrypoint registered `instrumentation.ts` for
     * this request: emits its lifecycle spans, inside the middleware span.
     */
    emitInstrumentationSpans?: () => void;
    /**
     * When the request was received (epoch milliseconds), if before the
     * adapter ran (e.g. while registering `instrumentation.ts`).
     */
    requestStartTime?: number;
};
export type EdgeHandler = (opts: {
    request: AdapterOptions['request'];
}) => Promise<FetchEventResult>;
export declare function adapter(params: AdapterOptions): Promise<FetchEventResult>;
