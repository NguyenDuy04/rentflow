import type { PrefetchHints } from '../../shared/lib/app-router-types';
import type { ManifestNode } from '../../build/webpack/plugins/flight-manifest-plugin';
import { type SegmentRequestKey } from '../../shared/lib/segment-cache/segment-value-encoding';
export declare function collectSegmentData(isCacheComponentsEnabled: boolean, fullPageDataBuffer: Buffer, staleTime: number, clientModules: ManifestNode, serverConsumerManifest: any, prefetchInlining: boolean, hints: PrefetchHints | null, isUpgradeableISRFallback: boolean): Promise<Map<SegmentRequestKey, Buffer>>;
/**
 * Compute prefetch hints for a route by measuring segment sizes and deciding
 * which segments should be inlined. Only runs at build time. The results are
 * written to prefetch-hints.json and loaded at server startup.
 *
 * This is a separate pass from collectSegmentData so that the inlining
 * decisions can be fed back into collectSegmentData to control which segments
 * are output as separate entries vs. inlined into their parent.
 *
 * `shouldAttemptStatic{Shell,Prefetch}` (computed by the caller from the prerender's
 * runtime-data tracking) is folded onto every node of the result, so the
 * manifest delivers it to every response like the other hint bits. It's
 * independent of the inlining feature: when `inlining` is false the sizing
 * pass is skipped entirely — no inlining bits are emitted — and only the
 * tree shape carrying the static-prefetch hint is built.
 *
 * Both kinds of hint have the same structure and the same lifetime — one
 * bitmask per node of the route tree, measured once per build and constant
 * for the deployment. They differ only in what they're derived from: the
 * inlining bits from the size of each segment's encoded response, the
 * static-prefetch bit from what the decoded body turned out to access.
 */
export declare function collectPrefetchHints(isCacheComponentsEnabled: boolean, fullPageDataBuffer: Buffer, staleTime: number, clientModules: ManifestNode, serverConsumerManifest: any, inlining: {
    maxSize: number;
    maxBundleSize: number;
} | false, shouldAttemptStaticShell: boolean, shouldAttemptStaticPrefetch: boolean): Promise<PrefetchHints>;
