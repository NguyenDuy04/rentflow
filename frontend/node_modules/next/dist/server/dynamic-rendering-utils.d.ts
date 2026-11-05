import { RenderStage, type AdvanceableRenderStage } from './app-render/staged-rendering';
import type { RequestStore, WorkUnitStore } from './app-render/work-unit-async-storage.external';
export declare function isHangingPromiseRejectionError(err: unknown): err is HangingPromiseRejectionError;
declare class HangingPromiseRejectionError extends Error {
    readonly route: string;
    readonly expression: string;
    readonly digest = "HANGING_PROMISE_REJECTION";
    constructor(route: string, expression: string);
}
export declare class ClientHookDynamicError extends Error {
    readonly digest = "CLIENT_HOOK_DYNAMIC";
    constructor(route: string, expression: string);
}
export declare function isClientHookDynamicError(err: unknown): err is ClientHookDynamicError;
/**
 * Constructs a promise that never resolves, standing in for *dynamic* data:
 * data that is only available during a real dynamic request and hangs in
 * every kind of prerender — `io()`, `connection()`, uncached `fetch()`.
 *
 * This is primarily useful for cacheComponents where we use promise
 * resolution timing to determine which parts of a render can be included in a
 * prerender.
 *
 * Records nothing on the prerender store: the promise's holes are only ever
 * filled by a real dynamic request, so a runtime prefetch response would have
 * the same holes as the static one. If the data source would resolve during a
 * runtime prerender, use `makeRuntimeHangingPromise` instead.
 */
export declare function makeDynamicHangingPromise<T>(signal: AbortSignal, route: string, expression: string): Promise<T>;
export declare function makeUntrackedHangingPromise<T>(signal: AbortSignal, route: string, expression: string): Promise<T>;
/**
 * Constructs a promise that never resolves, standing in for session data
 * (which a runtime shell can access).
 * Examples: cookies, headers
 *
 * Awaiting one of these during a static prerender records on the prerender
 * store that a runtime shell would produce more content than the static
 * static shell, which the segment prefetch encoding uses
 * to tell the client whether a runtime request could be skipped.
 *
 * When unsure whether data is dynamic or runtime, prefer this method — the
 * cost of over-recording is a redundant runtime prefetch request; the cost of
 * under-recording is a permanently missing one.
 *
 * For fallback-param data — data a concrete (ISR-upgraded) prerender would
 * resolve — use `makeFallbackParamsHangingPromise` instead, so the access
 * is recorded with the right effect on the static-prefetch hint.
 */
export declare function makeSessionDataHangingPromise<T>(signal: AbortSignal, route: string, expression: string, workUnitStore: WorkUnitStore): Promise<T>;
/**
 * Constructs a promise that never resolves, standing in for URL data,
 * which can be accessed in a runtime prefetch (but not a runtime shell).
 * Examples: fallback params, searchParams
 *
 * Awaiting one of these during a static prerender records on the prerender
 * store that a runtime prefetch would produce more content than the static
 * response, which the segment prefetch encoding uses
 * to tell the client whether a runtime prefetch request could be skipped.
 *
 * When unsure whether data is dynamic or runtime, prefer this method — the
 * cost of over-recording is a redundant runtime prefetch request; the cost of
 * under-recording is a permanently missing one.
 *
 * `workUnitStore` may be null ONLY when the caller tracks the access itself.
 * Such a caller MUST call `trackURLDataAccessed` from every path that
 * observes the promise (e.g. the proxy traps for `then`/`status`),
 * against the work unit store active at access time.
 *
 * For fallback-param data — data a concrete (ISR-upgraded) prerender would
 * resolve — use `makeFallbackParamsHangingPromise` instead, so the access
 * is recorded with the right effect on the static-prefetch hint.
 */
export declare function makeURLDataHangingPromise<T>(signal: AbortSignal, route: string, expression: string, workUnitStore: WorkUnitStore | null): Promise<T>;
/**
 * Creates a promise that stands in for a result that will either be session data
 * or URL data, but we don't know which.
 */
export declare function makeUnknownRuntimeDataHangingPromise<T>(signal: AbortSignal, route: string, expression: string, workUnitStore: WorkUnitStore): Promise<T>;
/**
 * Variant of `makeRuntimeHangingPromise` for *fallback-param* data: fallback
 * route params and values derived solely from them (`params`, `rootParams`,
 * `pathname` during a fallback prerender). Like every runtime data access,
 * awaiting it records the access on the prerender store's response-level flag,
 * but its effect on the build-time static-prefetch hint differs — on a
 * fallback-upgradeable route the access is transient (a concrete prerender
 * resolves it), so it leaves the hint intact. See `trackFallbackParamsAccessed`.
 *
 * As with `makeRuntimeHangingPromise`, `workUnitStore` may be null ONLY when
 * the caller tracks the access itself by calling `trackFallbackParamsAccessed`
 * from every path that observes the promise.
 */
export declare function makeFallbackParamsHangingPromise<T>(signal: AbortSignal, route: string, expression: string, workUnitStore: WorkUnitStore | null): Promise<T>;
export type PrerenderDataTracking = {
    /**
     * Records when the render has accessed a request data source
     * that hangs during a static prerender but would resolve during a runtime
     * prerender — cookies, headers, fallback params, searchParams, and cache
     * entries excluded only from static prerenders.
     *
     * The client uses this promise as the actual source of truth for whether a segment
     * needs a runtime request. Prefetch hints can become stale after a revalidation,
     * so if a hint says a static request should be enough but `runtimeDataAccessed`
     * resolves to `true`, a follow-up runtime request will be issued.
     * This applies to both shells and prefetches.
     *
     * The promise is embedded in the RSC payload (`InitialRSCPayload['u']`),
     * and is meant to be rewindable. This means that the shell might not have
     * any runtime data accesses, even when the prefetch does.
     * (this has some subtleties; see `markRuntimeDataAccessWhenStageReached`
     * for more)
     *
     * After the prerender, the promise is consumed by `collectSegmentData` and each
     * static prefetch will contain it (`PrefetchFlightResponse['u']`).
     * However, all the segments for a route will use the same promise (because we're
     * only tracking this on the page level) so if one segment needs runtime data, then
     * all segments will be marked as such.
     * However, on the client `isPartial` takes precedence over `runtimeDataAccessed`,
     * so complete segments will not end up being deopted.
     */
    readonly runtimeDataAccessed: PromiseWithResolvers<boolean>;
    /** Corresponds to `PrefetchHint.ShouldAttemptStaticShell`. */
    shouldAttemptStaticShell: boolean;
    /** Corresponds to `PrefetchHint.ShouldAttemptStaticPrefetch`. */
    shouldAttemptStaticPrefetch: boolean;
};
export declare function createPrerenderDataTracking(): PrerenderDataTracking;
export declare function finishPrerenderDataTracking(prerenderDataTracking: PrerenderDataTracking): void;
/**
 * Records on a static prerender store that the render accessed a data source
 * which would have resolved in a runtime prefetch (but NOT in a runtime shell)
 *  No-op for all other store types.
 *
 * Prefer `makeRuntimeHangingPromise`. Use this function only when implementing
 * similar tracking and that one is not enough.
 *
 * For fallback-param data, use `trackFallbackParamsAccessed` instead. When
 * unsure, this is the conservative choice.
 */
export declare function trackURLDataAccessed(workUnitStore: WorkUnitStore, expression: string): void;
/**
 * Fallback-param variant of `trackRuntimeDataAccessed`, for accesses of
 * fallback route params and values derived solely from them. It records the
 * response-level flag all the same, but only clears the build-time
 * static-prefetch hint when the route is not fallback-upgradeable — on an
 * upgradeable route the access is transient, since ISR later produces a
 * concrete prerender that resolves it.
 */
export declare function trackFallbackParamsAccessed(workUnitStore: WorkUnitStore, expression: string): void;
/**
 * Signals that we cannot recover both a runtime shell and a static (PPR) shell
 * from the same render. Use this whenever the stage of a promise varies on
 * `RequestStore.needsRuntimeShell`.
 * */
export declare function trackIncompatibleShellContent(workUnitStore: RequestStore, reason: string): void;
export declare function makeClientHookHangingPromise<T>(signal: AbortSignal, error: ClientHookDynamicError): Promise<T>;
/**
 * Creates a promise that will be triggered when another promise resolves.
 * It will not emit unhandled rejections, which is important if the trigger
 * is a promise that might itself get rejected (e.g. when a prerender/render
 * are aborted due to sync IO)
 */
export declare function makePromiseFromTrigger<T>(trigger: Promise<any>, value: T): Promise<T>;
export declare function makeDevtoolsIOAwarePromise<T>(underlying: T, requestStore: RequestStore, stage: AdvanceableRenderStage): Promise<T>;
/**
 * Invokes `onUse` whenever `then()/catch()/finally()` are called on the promise
 * or when the promise is awaited. */
export declare function trackPromiseUsed<T>(promise: Promise<T>, onUse: () => void): Promise<T>;
export declare const RENDER_STAGES_BY_DATA_KIND: {
    sessionData: RenderStage.ShellRuntime;
    /**
     * Statically-prerenderable URL data, like static `params`.
     * It may need to be pushed to a runtime stage in a runtime prerender,
     * but it's semantically distinct from `runtimeUrlData` like `searchParams`,
     * which is always excluded from static prerenders.
     * */
    staticUrlData: {
        /**
         * From that app's point of view, `prefetch()` is semantically the same as
         * `staticUrlData`, because it does not resolve in a shell but resolves in
         * a prefetch (even a static one).
         * We handle it separately to provide a specialized error in validation renders.
         */
        prefetchApi: {
            static: RenderStage.PrefetchStatic_prefetchApi;
            runtime: RenderStage.PrefetchRuntime_prefetchApi;
        };
        static: RenderStage.PrefetchStatic;
        runtime: RenderStage.PrefetchRuntime;
    };
    /**
     * URL data that is never statically-prerenderable, like static `searchParams`.
     * */
    runtimeUrlData: RenderStage.PrefetchRuntime;
};
export declare function applyOwnerStack(error: Error): Error;
export {};
