import type { Params } from '../../../server/request/params';
import type { AppPageRouteModule } from '../../../server/route-modules/app-page/module.compiled';
import type { AppRouteRouteModule } from '../../../server/route-modules/app-route/module.compiled';
import { type AppSegmentConfig } from './app-segment-config';
import type { DynamicParamTypes } from '../../../shared/lib/app-router-types';
type GenerateStaticParams = (options: {
    params?: Params;
}) => Promise<Params[]>;
export declare const PARAM_MATCHING_MODES: readonly ["not-found", "blocking", "fallback", "dynamic"];
export type ParamMatchingMode = (typeof PARAM_MATCHING_MODES)[number];
export type ParamMatching = Record<string, ParamMatchingMode>;
export type AppSegment = {
    name: string;
    paramName: string | undefined;
    paramType: DynamicParamTypes | undefined;
    filePath: string | undefined;
    config: AppSegmentConfig | undefined;
    paramMatching: ParamMatching | (() => Promise<ParamMatching>) | undefined;
    generateStaticParams: GenerateStaticParams | undefined;
    createEmptyParamsError?: () => Error;
};
export type AppSegmentTree = [
    segment: AppSegment,
    parallelRoutes: AppSegmentTree[]
];
/**
 * Collects the segments for a given route module.
 *
 * @param components the loaded components
 * @returns the segments for the route module
 */
export declare function collectSegments(routeModule: AppRouteRouteModule | AppPageRouteModule, config: {
    cacheComponents: boolean;
    partialPrefetching: boolean;
} | undefined): Promise<{
    segments: AppSegment[];
    segmentTree: AppSegmentTree[];
}>;
export {};
