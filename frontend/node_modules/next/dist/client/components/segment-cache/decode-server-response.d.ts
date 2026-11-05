/**
 * Decoding of RSC server responses (the transport format defined in
 * shared/lib/rsc-transport) into the client's own representations. This is
 * the only place on the client that consumes transport types; everything
 * downstream operates on RouteTree / NavigationSeed / CacheNode.
 */
import type { FlightRouterState, Segment as FlightRouterStateSegment } from '../../../shared/lib/app-router-types';
import type { PartialTransportData, PartialTransportNode } from '../../../shared/lib/rsc-transport';
import type { VaryParamsIterable } from '../../../shared/lib/segment-cache/vary-params-decoding';
import { type SegmentRequestKey } from '../../../shared/lib/segment-cache/segment-value-encoding';
import type { NormalizedSearch } from './cache-key';
import type { PartialVaryPath, VaryPath } from './vary-path';
import { type RouteTree, type RootRouteTree, type RSCSegmentData, type RefreshState, type RouteTreeAccumulator } from './cache';
export type NavigationSeed = {
    renderedSearch: NormalizedSearch;
    /**
     * The decoded response. The head's `data` is decoded exactly like a segment
     * node's: null when the response carries no head.
     */
    root: RootRouteTree<RSCSegmentData | null>;
    dynamicStaleAt: number;
    treeDivergedFromBase: boolean;
};
/**
 * During a client navigation or prefetch, the server responds with a
 * transport tree that covers only the parts of the route that have changed.
 * This overlays it onto the base tree to produce a full RouteTree — slots the
 * response carries no information about are reused from the client's current
 * state — with the response's render output (RSCSegmentData) attached to
 * each node.
 *
 * "Create", not "decode": callers may pass no transport data at all
 * (refreshes and history restores do), in which case this converts the base
 * tree alone rather than decoding a response.
 */
export declare function createNavigationSeed(now: number, currentTree: FlightRouterState | null, transportData: PartialTransportData | null, rootVaryParams: VaryParamsIterable | null, isResponsePartial: boolean, renderedPathname: string | null, renderedSearch: string, metadataVaryPath: VaryPath | null, dynamicStaleTimeSeconds: number): NavigationSeed;
/**
 * Creates a RouteTree node for a segment, with its identity and cache-key
 * information (vary paths, the normalized segment value, the refresh state)
 * initialized, and the remaining fields set to their defaults. The caller
 * finishes initializing those in place after recursing into the children.
 * Shared by FlightRouterState conversion, transport decoding, and subtree
 * rebasing so their routing identity stays consistent.
 */
export declare function createRouteTreeNode<TData>(originalSegment: FlightRouterStateSegment, isRootParam: boolean, requestKey: SegmentRequestKey, parentPartialVaryPath: PartialVaryPath | null, renderedSearch: NormalizedSearch, refreshState: RefreshState | null, acc: RouteTreeAccumulator): RouteTree<TData | null>;
/**
 * Decodes a response's transport tree into a RouteTree, using the client's
 * current router state as the base for the parts of the route the response
 * carries no information about.
 *
 * The response is an overlay over the base:
 *
 * - Nodes with rendered output — and nodes with no data at all, which are
 *   server-sent structure whose output the client fetches lazily — are
 *   authoritative: their identity, hints, and subtree come entirely from
 *   the response.
 * - Skipped nodes (data with a null rsc) sit on the path from the root down
 *   to the rendered subtrees. The client is expected to already have them,
 *   so their refresh state and hints are inherited from the base tree, and
 *   any slot the response doesn't mention is reused from the base as-is.
 *
 * TODO: The base is a FlightRouterState only because that's the
 * representation the client router currently renders from (the router
 * reducer's `state.tree`, which the render tree and layout-router are
 * keyed against). Once the rendering path is updated to use RouteTree as its
 * source of truth, the base tree here can be a RouteTree, and the base-only
 * conversion path (convertFlightRouterStateToRouteTree) goes away with it.
 */
export declare function decodeTransportTreeIntoRouteTree(transportNode: PartialTransportNode, baseRouterState: FlightRouterState | null, rootVaryParams: VaryParamsIterable | null, isResponsePartial: boolean, renderedPathname: string | null, renderedSearch: NormalizedSearch, acc: RouteTreeAccumulator): RouteTree<RSCSegmentData | null>;
/**
 * Reads a segment's partialness from its `isPartial` promise. (The
 * fulfillment value is void — partialness is encoded as the ABSENCE of a
 * fulfillment.) The server fulfills it only for a fully-static segment and
 * leaves it pending for a partial one (see the promise form of
 * `TransportSegmentData['p']`), so partial == not fulfilled. A pending row,
 * or a truncated shell decode whose fulfillment landed past the boundary,
 * reads as partial, which is correct either way.
 */
export declare function readFulfilledIsPartial(isPartial: Promise<void>): boolean;
/**
 * Reads a staleTime (in seconds) from the staleTime async iterable of a
 * fully-buffered response. Because the bytes are all present, each yielded
 * value is already visible on its chunk's thenable status, so this drains
 * synchronously and takes the last value (the final staleTime, matching the
 * async `resolveStaleAt` in cache.ts). Returns null when no usable value was
 * yielded — e.g. a truncated shell decode whose value landed past the
 * boundary — so the caller can fall back to its response-level staleness.
 */
export declare function readFulfilledStaleTimeSeconds(staleTime: AsyncIterable<number>): number | null;
