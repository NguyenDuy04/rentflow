import { PAGE_SEGMENT_KEY } from './segment';
/**
 * Creates the data for a skipped segment: a null `r` marks the position as
 * acknowledged by the response, with no output attached (see the note on
 * TransportSegmentData). Used by producers for the segments along the path
 * from the root down to the rendered subtrees.
 */ export function createSkippedSegmentData() {
    return {
        r: null,
        p: true,
        v: null
    };
}
/**
 * Reads a late-resolving value from a fully-buffered Flight decode via the
 * thenable's status. Flight sets `status`/`value` on a row's promise once
 * its bytes are processed, and a buffered decode processes every byte
 * synchronously, so any row that made it into the payload is readable
 * without awaiting. Returns `unresolvedValue` for a row that is pending or
 * absent in this decode — e.g. one whose fulfillment landed past a
 * truncated shell decode's boundary; that's what scopes a response's
 * late-resolving signals to the payload being decoded. Returns
 * `rejectedValue` (defaults to `unresolvedValue`) for a rejected row — an
 * aborted render errors rows that were still pending when it happened.
 *
 * Shared by client and server: the client reads buffered prefetch
 * responses; the server (collect-segment-data) reads the buffered page
 * payload it re-serializes into per-segment responses.
 */ export function readFulfilledValue(valueFromServer, unresolvedValue, rejectedValue = unresolvedValue) {
    const thenable = valueFromServer;
    // Force Flight to unwrap a received-but-not-yet-settled row.
    thenable.then(noop, noop);
    switch(thenable.status){
        case 'fulfilled':
            return thenable.value;
        case 'rejected':
            return rejectedValue;
        // No status yet: the row is still pending, or absent from this decode.
        case undefined:
        default:
            return unresolvedValue;
    }
}
const noop = ()=>{};
/**
 * Converts a segment's client/server-internal representation to its wire
 * representation.
 */ export function segmentToTransportSegment(segment) {
    if (typeof segment === 'string') {
        return segment;
    }
    return {
        n: segment[0],
        t: segment[2],
        k: segment[1],
        s: segment[3]
    };
}
/**
 * Converts a segment's wire representation to the client/server-internal
 * `Segment` type.
 */ export function transportSegmentToSegment(transportSegment) {
    if (typeof transportSegment === 'string') {
        return transportSegment;
    }
    return [
        transportSegment.n,
        // `k` may be null when the client is expected to parse the param value
        // from the URL (per-segment prefetch responses). Callers that need the
        // real value resolve it from the rendered pathname instead of using this
        // function (see resolveTransportSegment in decode-server-response); the
        // remaining callers are value-insensitive (segment request keys, which
        // never include param values) or only see concrete keys.
        transportSegment.k ?? '',
        transportSegment.t,
        transportSegment.s
    ];
}
/**
 * Derives a FlightRouterState from a transport tree. Used where the client
 * needs a router-state representation of a full response (e.g. the initial
 * hydration payload). Render output (`d`) is not carried over.
 */ export function transportNodeToFlightRouterState(node, renderedSearch) {
    const parallelRoutes = {};
    const children = node.c;
    if (children !== undefined) {
        for (const [parallelRouteKey, childNode] of children){
            parallelRoutes[parallelRouteKey] = transportNodeToFlightRouterState(childNode, renderedSearch);
        }
    }
    const flightRouterState = [
        transportSegmentToSegment(node.s),
        parallelRoutes
    ];
    if (node.h !== undefined) {
        flightRouterState[4] = node.h;
    }
    if (flightRouterState[0] === PAGE_SEGMENT_KEY) {
        flightRouterState[5] = renderedSearch;
    }
    return flightRouterState;
}

//# sourceMappingURL=rsc-transport.js.map