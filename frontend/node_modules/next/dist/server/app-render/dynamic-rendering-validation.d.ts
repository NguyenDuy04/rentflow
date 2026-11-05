import type { WorkStore } from './work-async-storage.external';
import { type ValidationBoundaryTracking } from './instant-validation/boundary-tracking';
import type { InstantValidationSampleTracking } from './instant-validation/instant-samples';
import type { DynamicTrackingState } from './dynamic-rendering';
export type DynamicValidationState = {
    hasSuspenseAboveBody: boolean;
    hasDynamicMetadata: boolean;
    dynamicMetadata: null | Error;
    hasDynamicViewport: boolean;
    hasAllowedDynamic: boolean;
    dynamicErrors: Array<Error>;
};
export declare function createDynamicValidationState(): DynamicValidationState;
export declare function trackDynamicAccessInStaticRoute(dynamicReason: unknown, workStore: WorkStore, componentStack: string, dynamicValidation: DynamicValidationState, clientDynamic: DynamicTrackingState, isServerPartial: boolean, kind: StaticValidationHoleKind): void;
export declare function trackAllowedDynamicAccess(dynamicReason: unknown, workStore: WorkStore, componentStack: string, dynamicValidation: DynamicValidationState, clientDynamic: DynamicTrackingState): void;
export declare enum DynamicHoleKind {
    /** We know that this hole is caused by runtime data. */
    Runtime = 1,
    /** We know that this hole is caused by link data. */
    Link = 2,
    /** We know that this hole is caused by navigation(). */
    Navigation = 3,
    /** We know that this hole is caused by prefetch(). */
    Prefetch = 4,
    /** We know that this hole is caused by dynamic data. */
    Dynamic = 5,
    /** We know that this hole is caused by runtime or dynamic data, but don't know which. */
    RuntimeOrDynamic = 6
}
export type InstantValidationHoleKind = Exclude<DynamicHoleKind, DynamicHoleKind.RuntimeOrDynamic>;
export type StaticValidationHoleKind = DynamicHoleKind.Runtime | DynamicHoleKind.Dynamic | DynamicHoleKind.RuntimeOrDynamic;
/** Stores dynamic reasons used during an SSR render in instant validation. */
export type InstantValidationState = {
    hasDynamicMetadata: boolean;
    hasAllowedClientDynamicAboveBoundary: boolean;
    dynamicMetadata: null | Error;
    hasDynamicViewport: boolean;
    hasAllowedDynamic: boolean;
    dynamicErrors: Array<Error>;
    validationPreventingErrors: Array<Error>;
    thrownErrorsOutsideBoundary: Array<unknown>;
    /** Per-slot config factories. Index 0 is the root config (fallback).
     * Indices 1+ correspond to slot marker components in the tree. */
    slotStacks: Array<(() => Error) | null>;
};
export declare function createInstantValidationState(slotStacks: Array<(() => Error) | null>): InstantValidationState;
export declare function trackDynamicHoleInNavigation(dynamicReason: unknown, workStore: WorkStore, componentStack: string, dynamicValidation: InstantValidationState, clientDynamic: DynamicTrackingState, kind: InstantValidationHoleKind, boundaryState: ValidationBoundaryTracking): void;
export declare function trackThrownErrorInNavigation(workStore: WorkStore, dynamicValidation: InstantValidationState, thrownValue: unknown, componentStack: string, reactBrowserBailout: boolean): void;
export declare function trackDynamicHoleInStaticShell(dynamicReason: unknown, workStore: WorkStore, componentStack: string, dynamicValidation: DynamicValidationState, clientDynamic: DynamicTrackingState, kind: DynamicHoleKind.Runtime | DynamicHoleKind.Dynamic): void;
export declare enum PreludeState {
    Full = 0,
    Empty = 1,
    Errored = 2
}
export declare function logDisallowedDynamicError(workStore: WorkStore, error: Error): void;
export declare function throwIfSyncIOUsed(workStore: WorkStore, serverDynamic: DynamicTrackingState): void;
export declare function throwIfDisallowedDynamic(workStore: WorkStore, prelude: PreludeState, dynamicValidation: DynamicValidationState, serverDynamic: DynamicTrackingState, allowEmptyStaticShell: boolean): void;
export declare function throwIfDisallowedDynamicInStaticRoute(workStore: WorkStore, prelude: PreludeState, dynamicValidation: DynamicValidationState, serverDynamic: DynamicTrackingState, isFallbackShell: boolean, allowEmptyStaticShell: boolean, isServerPartial: boolean): void;
export declare function getDisallowedReasonsInStaticRoute(workStore: WorkStore, prelude: PreludeState, dynamicValidation: DynamicValidationState, serverDynamic: DynamicTrackingState | null, isFallbackShell: boolean, allowEmptyStaticShell: boolean, isServerPartial: boolean): Error[];
export declare function getStaticShellDisallowedDynamicReasons(workStore: WorkStore, prelude: PreludeState, dynamicValidation: DynamicValidationState, allowEmptyStaticShell: boolean): Array<Error>;
/**
 * `errors` are validation failures that should be surfaced immediately.
 * `deferredFallback` carries a missing-boundary explanation that the caller
 * should hold back until *every* validation depth has been tried — a missing
 * boundary often just means a parent layout intentionally omitted a slot, and
 * a different depth's validation may surface a more meaningful error.
 */
export type NavigationValidationResult = Array<Error> | Error | AggregateError;
export declare function getNavigationDisallowedDynamicReasons(workStore: WorkStore, prelude: PreludeState, dynamicValidation: InstantValidationState, validationSampleTracking: InstantValidationSampleTracking | null, boundaryState: ValidationBoundaryTracking, devRenderDidError: boolean): NavigationValidationResult;
