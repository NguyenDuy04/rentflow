import type { Segment } from '../../../shared/lib/app-router-types';
import type { VaryPath } from '../segment-cache/vary-path';
export declare function createSegmentKey(segment: Segment): string;
export declare function createHeadKey(varyPath: VaryPath): string;
