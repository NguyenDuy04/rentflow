/**
 * Centralized error factories for cached function and revalidation misuse.
 * State the scope and constraint, explain non-obvious boundaries, give the
 * immediate fix, then link to the relevant docs.
 */
import type { BuildTimeGeneratorName } from '../app-render/work-unit-async-storage.external';
export declare function createCookiesInUseCacheError(route: string): Error;
export declare function createCookiesInUnstableCacheError(route: string): Error;
export declare function createHeadersInUseCacheError(route: string): Error;
export declare function createHeadersInUnstableCacheError(route: string): Error;
export declare function createSearchParamsInUseCacheError(route: string): Error;
export declare function createConnectionInPublicUseCacheError(route: string): Error;
export declare function createConnectionInPrivateUseCacheError(route: string): Error;
export declare function createConnectionInUnstableCacheError(route: string): Error;
export declare function createRouteHandlerRequestInUseCacheError(route: string, expression: string): Error;
export declare function createRouteHandlerRequestInUnstableCacheError(route: string, expression: string): Error;
/**
 * Used when `draftMode().enable()` or `.disable()` is called inside
 * `"use cache"` or `"use cache: private"`. Reading `draftMode()` is fine
 * inside a cached function, but toggling it is not.
 */
export declare function createDraftModeMutationInUseCacheError(route: string, expression: string): Error;
export declare function createDraftModeMutationInUnstableCacheError(route: string, expression: string): Error;
export declare function createRevalidateDuringRenderError(route: string, expression: string): Error;
export declare function createRevalidateInCachedFunctionError(route: string, expression: string): Error;
export declare function createRevalidateInBuildTimeGeneratorError(route: string, expression: string, generatorName: BuildTimeGeneratorName): Error;
export declare function createCacheTagOutsideUseCacheError(route: string | undefined): Error;
export declare function createCacheLifeOutsideUseCacheError(route: string | undefined): Error;
export declare function createNestedCacheZeroRevalidateError(route: string, cause: Error | undefined): Error;
export declare function createNestedCacheShortExpireError(route: string, cause: Error | undefined): Error;
export declare function createUseCachePrivateInsidePublicUseCacheError(route: string): Error;
export declare function createUseCachePrivateInsideUnstableCacheError(route: string): Error;
export declare function createUseCachePrivateOutsideRequestContextError(route: string, functionName: string): Error;
