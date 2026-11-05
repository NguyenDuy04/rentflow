import type { CachedImageValue, IncrementalCacheEntry } from '../response-cache/types';
import type { ImageUpstream } from './transform';
export declare function getPreviouslyCachedImageOrNull(upstreamImage: ImageUpstream, previousCacheEntry: IncrementalCacheEntry | null | undefined): CachedImageValue | null;
