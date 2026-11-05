import { type AppSegmentTree, type ParamMatching } from '../segment-config/app/app-segments';
import type { FallbackRouteParam } from './types';
import { FallbackMode } from '../../lib/fallback';
export declare function resolveParamMatching(page: string, segmentTree: readonly AppSegmentTree[], pathnameSegments: ReadonlyArray<{
    readonly paramName: string;
}>): Promise<ParamMatching | undefined>;
/**
 * Validate closure after every page's policies have been evaluated and merged.
 * Identify each parameter definition by its normalized URL prefix, including
 * the parameter name. /blog/[slug] and /shop/[slug] are independent; route
 * groups and parallel slots are removed by normalization and share the same
 * definition when their URL prefixes match.
 */
export declare function validateParamMatchingCoherence(paramMatchingByRoute: ReadonlyMap<string, ParamMatching | undefined>): void;
export declare function getParamMatchingFallbackMode(paramMatching: Readonly<ParamMatching>, fallbackRouteParams: readonly Pick<FallbackRouteParam, 'paramName'>[], inferredFallbackMode: FallbackMode | undefined, rootParamKeys: ReadonlySet<string>): FallbackMode | undefined;
export declare function validateParamMatchingParams(page: string, paramMatching: Readonly<ParamMatching>, generatedParamNames: ReadonlySet<string>, missingParamNames: ReadonlySet<string>, pathnameSegments: ReadonlyArray<{
    readonly paramName: string;
}>, output: 'export' | 'standalone' | undefined): void;
