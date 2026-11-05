/**
 * Vary Params Decoding
 *
 * This module is shared between server and client.
 */
/**
 * The vary path id for search params. Path params are identified by their
 * name. Search params don't have a fixed set of names, so any access to them
 * is reported under this one id, and the segment is keyed by the whole search
 * string (see createVaryingSearchParams in app-render/vary-params.ts).
 *
 * It's a number so it can't collide with a param name. `app/[?]/page.tsx` is a
 * valid route.
 */
export declare const SEARCH_PARAMS_VARY_ID = 0;
export type VaryParamId = string | number;
/**
 * The params a piece of rendered output depends on — the ids of the vary path
 * nodes it read: path param names, and SEARCH_PARAMS_VARY_ID for the search
 * params — as the source that reports them rather than a snapshot of it.
 *
 * The wire iterables can only be drained from a fully-buffered response; they
 * are drained once at decode into an already-settled thenable, and read at the
 * point a decision needs the set (readVaryParams).
 */
export type VaryParams = PromiseLike<Set<VaryParamId>>;
/**
 * Vary params are serialized into the Flight stream as an
 * `AsyncIterable<VaryParamId>` that yields each accessed param id exactly once
 * (the server dedupes before emitting). Because each access is flushed into the
 * stream as it happens, there's no step at the end of the render that has to
 * run for the client to read anything. If a prerender is aborted by sync I/O,
 * the params yielded before the abort are already in the stream, and they're
 * exactly the params the partial response actually depends on.
 *
 * Root params are NOT included in a segment's own iterable. They're emitted
 * once at the top level of the response (as a separate iterable) and unioned in
 * by `decodeVaryParams`, because root params can be accessed at any point
 * during the render — folding them into every segment would otherwise require
 * a merge once the whole render is complete.
 */
export type VaryParamsIterable = AsyncIterable<VaryParamId>;
/**
 * Converts a segment's (or the head's) vary params off the wire, at the
 * decode boundary, unioning in the response-level root params.
 *
 * Root params are emitted once at the top level rather than folded into every
 * segment by the server, so every decode recombines them here — building the
 * merge into the decode means a caller can't forget it, and it's done in a
 * single pass with no intermediate set.
 *
 * Returns null ("unknown", key on all params) unless BOTH iterables are
 * present. A null/absent `iterable` means the segment's own tracking wasn't
 * enabled (e.g. not a prerender). A null/absent `rootIterable` means root
 * params weren't tracked — and since a segment's own iterable never includes
 * root params (those are accessed in layouts above it), narrowing on the
 * segment set alone would wrongly assume no root params were accessed. In
 * either case we stay conservative.
 *
 * When both are present each is authoritative even when it drains to the empty
 * set — a tracked segment that read no params, with no root params accessed,
 * can be shared across all param values.
 */
export declare function decodeVaryParams(iterable: VaryParamsIterable | null | undefined, rootIterable: VaryParamsIterable | null | undefined): VaryParams | null;
/**
 * Wraps an already-known set as a vary params source. Shaped like a settled
 * Flight promise so readVaryParams can read it off the thenable's status.
 */
export declare function createVaryParams(total: Set<VaryParamId>): VaryParams;
/**
 * Reads the set from a vary params source. Null when it is not available;
 * the reader assumes every param varies.
 */
export declare function readVaryParams(varyParams: VaryParams): Set<VaryParamId> | null;
