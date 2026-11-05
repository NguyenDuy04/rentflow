import type { LoaderTree } from '../lib/app-dir-module';
import { type PrefetchHints } from '../../shared/lib/app-router-types';
import type { FullTransportNode, PartialTransportNode } from '../../shared/lib/rsc-transport';
import type { GetDynamicParamFromSegment } from './app-render';
export type MissingPrefetchHintPolicy = 'mark-stale' | 'disable-prefetching' | 'none';
/**
 * Selects the client fallback when prefetch inlining is enabled but no hint
 * tree is available.
 */
export declare function getMissingPrefetchHintPolicy(isBuildTimePrerendering: boolean, isPrerendering: boolean, cacheComponents: boolean): MissingPrefetchHintPolicy;
/**
 * Computes the segment-local prefetch hints for a loader tree node: the
 * precomputed build-time hints unioned with the hints derived from the
 * segment's own configuration (instant/prefetch exports, loading boundary,
 * root layout position). Does not include the "subtree" bits propagated up
 * from children — the caller folds those in with propagateSubtreeBits as it
 * assembles the tree.
 *
 * Shared by createComponentTree (rendered trees) and the builders in this
 * module (structure-only trees) so the two cannot drift.
 */
export declare function computeSegmentPrefetchHints(loaderTree: LoaderTree, hintTree: PrefetchHints | null, prefetchInliningEnabled: boolean, missingPrefetchHintPolicy: MissingPrefetchHintPolicy, partialPrefetching: boolean, isRootLayoutOrAbove: boolean, notFoundParams: readonly string[] | undefined): Promise<number>;
/**
 * Builds a structure-only transport tree from the loader tree: identity and
 * hints, no render output on any node. Used for router-state-only responses
 * and for the structure beneath a loading-boundary cut in a non-PPR
 * prefetch, where the client fetches the content lazily.
 */
export declare function createTransportTreeFromLoaderTree(loaderTree: LoaderTree, hintTree: PrefetchHints | null, prefetchInliningEnabled: boolean, missingPrefetchHintPolicy: MissingPrefetchHintPolicy, partialPrefetching: boolean, getDynamicParamFromSegment: GetDynamicParamFromSegment, notFoundParams: readonly string[] | undefined, didFindRootLayout?: boolean): Promise<PartialTransportNode>;
/**
 * Builds a full transport tree from the loader tree where every position is
 * skipped. Used for error payloads, which don't render the route: the caller
 * attaches the error shell to the root node's data.
 */
export declare function createFullTransportTreeFromLoaderTree(loaderTree: LoaderTree, hintTree: PrefetchHints | null, prefetchInliningEnabled: boolean, missingPrefetchHintPolicy: MissingPrefetchHintPolicy, partialPrefetching: boolean, getDynamicParamFromSegment: GetDynamicParamFromSegment, notFoundParams: readonly string[] | undefined): Promise<FullTransportNode>;
/**
 * Builds the transport tree for a route tree prefetch response. Router state
 * only — no render output.
 */
export declare function createRouteTreePrefetch(loaderTree: LoaderTree, hintTree: PrefetchHints | null, prefetchInliningEnabled: boolean, missingPrefetchHintPolicy: MissingPrefetchHintPolicy, partialPrefetching: boolean, getDynamicParamFromSegment: GetDynamicParamFromSegment, notFoundParams: readonly string[] | undefined, didFindRootLayout?: boolean): Promise<PartialTransportNode>;
