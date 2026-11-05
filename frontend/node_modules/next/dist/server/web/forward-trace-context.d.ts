import type { TraceContextHeaders } from '../lib/trace/tracer';
/**
 * The trace context of the span that the middleware span and the downstream
 * request (the render) share as their parent, given the middleware's active
 * context (before the middleware span starts).
 *
 * When the active context is the one the request carries (an incoming
 * `traceparent`, or the one next-server's middleware-invoke pass wrote onto
 * the request), the received `traceparent` / `tracestate` are returned
 * verbatim, so the middleware never changes them. Otherwise (an active host
 * span, or a root span inserted by the middleware adapter) the active
 * context is returned.
 */
export declare function getSharedParentTraceContext(requestHeaders: Headers, activeTraceContext: TraceContextHeaders | undefined): TraceContextHeaders | undefined;
/**
 * Makes sure the downstream request of a middleware response that continues
 * the request (`NextResponse.next()` or a rewrite) carries the trace context
 * of the middleware span's parent, so the render is a sibling of the
 * middleware span in the same trace. It is passed as `traceparent` /
 * `tracestate` request-header overrides, which every host applies to the
 * downstream request: hosts that invoke middleware separately from the render
 * (deployments, adapters, direct entrypoints) as well as next-server's router
 * server.
 *
 * `traceparent` and `tracestate` are forwarded as a pair: the downstream
 * request never carries one trace context's `traceparent` with another's
 * `tracestate`. Request-header overrides replace the whole downstream request
 * header set, so:
 * - Without user overrides (or with an empty list, which hosts ignore):
 *   nothing is added when the request already carries that trace context.
 *   Otherwise every request header the middleware received is listed
 *   (unchanged) alongside the trace context, except a received `tracestate`
 *   when the trace context has none.
 * - With user overrides, they are kept and the trace context headers are
 *   added. A `traceparent` the user explicitly set (to a value other than the
 *   one the middleware received) wins, together with whatever `tracestate`
 *   the user set (if any). Otherwise (`traceparent` copied unchanged from the
 *   request, e.g. via `new Headers(request.headers)`, or omitted) both are set
 *   to the trace context, dropping a user `tracestate` when it has none.
 */
export declare function forwardTraceContextToRequest(responseHeaders: Headers, requestHeaders: Headers, traceContext: TraceContextHeaders | undefined): void;
