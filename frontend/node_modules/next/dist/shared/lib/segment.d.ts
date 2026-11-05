import type { FlightRouterState, Segment } from './app-router-types';
export declare function getSegmentValue(segment: Segment): string;
export declare function isGroupSegment(segment: string): boolean;
export declare function isParallelRouteSegment(segment: string): boolean;
export declare function computeSelectedLayoutSegment(segments: string[] | null, parallelRouteKey: string): string | null;
/** Get the canonical parameters from the current level to the leaf node. */
export declare function getSelectedLayoutSegmentPath(tree: FlightRouterState, parallelRouteKey: string, first?: boolean, segmentPath?: string[]): string[];
export declare const PAGE_SEGMENT_KEY = "__PAGE__";
export declare const DEFAULT_SEGMENT_KEY = "__DEFAULT__";
export declare const NOT_FOUND_SEGMENT_KEY = "/_not-found";
