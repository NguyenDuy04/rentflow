import type { VaryPath } from '../segment-cache/vary-path';
export { createRouterCacheKey as createSegmentKey } from './create-router-cache-key';
export declare function createHeadKey(varyPath: VaryPath): string;
