import type { OpaqueFallbackRouteParams } from '../request/fallback-params';
import type { Params } from '../request/params';
export declare function allParamsAreRootParams(underlyingParams: Params, rootParams: Params): boolean;
export declare function isEmptyParams(params: Params): boolean;
export declare function hasFallbackRouteParams(underlyingParams: Params, fallbackParams: OpaqueFallbackRouteParams | ReadonlySet<string> | null | undefined): boolean;
