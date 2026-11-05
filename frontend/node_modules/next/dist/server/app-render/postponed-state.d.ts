import type { OpaqueFallbackRouteParams } from '../request/fallback-params';
import { type PrerenderResumeDataCache, type RenderResumeDataCache } from '../resume-data-cache/resume-data-cache';
export declare enum DynamicState {
    /**
     * The dynamic access occurred during the RSC render phase.
     */
    DATA = 1,
    /**
     * The dynamic access occurred during the HTML shell render phase.
     */
    HTML = 2
}
/**
 * A postponed state with a resume data cache but no React HTML-resume state.
 */
export type DynamicDataPostponedState = {
    /**
     * The type of dynamic state.
     */
    readonly type: DynamicState.DATA;
    /**
     * The params to defer during the resumed render. The render uses request
     * metadata when this field is absent. `null` explicitly means no fallback
     * params.
     */
    readonly stagedFallbackParams?: ReadonlySet<string> | null;
    /**
     * The immutable resume data cache.
     */
    readonly renderResumeDataCache: RenderResumeDataCache;
};
/**
 * The postponed state for dynamic HTML.
 */
export type DynamicHTMLPostponedState = {
    /**
     * The type of dynamic state.
     */
    readonly type: DynamicState.HTML;
    /**
     * The params to defer during the resumed render. An HTML state always records
     * this set, and `null` means the prerender had no fallback params. Unlike the
     * data state, it never falls back to request metadata.
     */
    readonly stagedFallbackParams: ReadonlySet<string> | null;
    /**
     * The postponed data used by React.
     */
    readonly data: [
        preludeState: DynamicHTMLPreludeState,
        postponed: ReactPostponed
    ];
    /**
     * The immutable resume data cache.
     */
    readonly renderResumeDataCache: RenderResumeDataCache;
};
export declare const enum DynamicHTMLPreludeState {
    Empty = 0,
    Full = 1
}
type ReactPostponed = NonNullable<import('react-dom/static').PrerenderResult['postponed']>;
export type PostponedState = DynamicDataPostponedState | DynamicHTMLPostponedState;
export declare function getDynamicHTMLPostponedState(postponed: ReactPostponed, preludeState: DynamicHTMLPreludeState, fallbackRouteParams: OpaqueFallbackRouteParams | null, resumeDataCache: PrerenderResumeDataCache | RenderResumeDataCache, isCacheComponentsEnabled: boolean, maxPostponedStateSizeBytes?: number, disableResumeDataCacheCompression?: boolean): Promise<string>;
export declare function getDynamicDataPostponedState(resumeDataCache: PrerenderResumeDataCache | RenderResumeDataCache, isCacheComponentsEnabled: boolean, maxPostponedStateSizeBytes?: number, disableResumeDataCacheCompression?: boolean, fallbackRouteParams?: OpaqueFallbackRouteParams | null): Promise<string>;
export declare function parseResumeDataCacheFromPostponedState(state: string, maxPostponedStateSizeBytes: number | undefined, disableResumeDataCacheCompression?: boolean): RenderResumeDataCache;
export declare function parsePostponedState(state: string, maxPostponedStateSizeBytes: number | undefined, disableResumeDataCacheCompression?: boolean): PostponedState;
export declare function getPostponedFromState(state: DynamicHTMLPostponedState): {
    preludeState: DynamicHTMLPreludeState;
    postponed: import("react-dom/static").PostponedState;
};
/**
 * Cheaply determines whether a serialized postponed state represents an empty
 * HTML prelude — i.e. the static shell rendered no bytes before the first
 * dynamic hole (a blocking dynamic API at the root with no Suspense boundary
 * above it). Returns false for dynamic-data states or unparseable input.
 *
 * Unlike `parsePostponedState`, this does not build a resume data cache: it only
 * reads the prelude marker. The Instant Navigation Testing API uses this to
 * detect the blank-document case in both dev (fresh render) and production
 * (prebuilt shell), where the marker is persisted in the postponed state.
 */
export declare function isEmptyHTMLPrelude(state: string): boolean;
export {};
