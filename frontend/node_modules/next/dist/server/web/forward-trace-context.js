"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    forwardTraceContextToRequest: null,
    getSharedParentTraceContext: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    forwardTraceContextToRequest: function() {
        return forwardTraceContextToRequest;
    },
    getSharedParentTraceContext: function() {
        return getSharedParentTraceContext;
    }
});
const OVERRIDE_HEADERS = 'x-middleware-override-headers';
const REQUEST_HEADER_PREFIX = 'x-middleware-request-';
// The trace ID and parent ID of a W3C `traceparent`
// (`version-traceid-parentid-flags`), lower-cased.
function getTraceparentIds(traceparent) {
    const [, traceId, parentId] = (traceparent == null ? void 0 : traceparent.toLowerCase().split('-')) ?? [];
    return traceId && parentId ? `${traceId}-${parentId}` : undefined;
}
function getSharedParentTraceContext(requestHeaders, activeTraceContext) {
    if (!activeTraceContext) {
        return undefined;
    }
    const receivedTraceparent = requestHeaders.get('traceparent');
    const receivedIds = getTraceparentIds(receivedTraceparent);
    if (receivedTraceparent && receivedIds && receivedIds === getTraceparentIds(activeTraceContext.traceparent)) {
        const receivedTracestate = requestHeaders.get('tracestate');
        return receivedTracestate ? {
            traceparent: receivedTraceparent,
            tracestate: receivedTracestate
        } : {
            traceparent: receivedTraceparent,
            tracestate: undefined
        };
    }
    return activeTraceContext;
}
function forwardTraceContextToRequest(responseHeaders, requestHeaders, traceContext) {
    if (!traceContext) {
        return;
    }
    // Redirects and direct responses have no downstream request.
    if (!responseHeaders.has('x-middleware-next') && !responseHeaders.has('x-middleware-rewrite')) {
        return;
    }
    const userOverrides = responseHeaders.get(OVERRIDE_HEADERS);
    // An empty override list is ignored by hosts (no headers are replaced), so
    // treat it like no overrides rather than turning it into "only the trace
    // context headers".
    if (!userOverrides) {
        if (requestHeaders.get('traceparent') === traceContext.traceparent && requestHeaders.get('tracestate') === (traceContext.tracestate ?? null)) {
            // The downstream request already carries the trace context.
            return;
        }
        const keys = [];
        for (const [key, value] of requestHeaders){
            if (!isTraceHeader(key)) {
                responseHeaders.set(REQUEST_HEADER_PREFIX + key, value);
                keys.push(key);
            }
        }
        setTraceContextOverrides(responseHeaders, keys, traceContext);
        return;
    }
    const keys = userOverrides.split(',').map((key)=>key.trim()).filter(Boolean);
    if (keys.includes('traceparent') && responseHeaders.get(REQUEST_HEADER_PREFIX + 'traceparent') !== requestHeaders.get('traceparent')) {
        // The user explicitly set the `traceparent`: keep both trace headers as
        // the user set them.
        return;
    }
    setTraceContextOverrides(responseHeaders, keys.filter((key)=>!isTraceHeader(key)), traceContext);
}
function isTraceHeader(key) {
    return key === 'traceparent' || key === 'tracestate';
}
// Lists the trace context's `traceparent` and `tracestate` (or no
// `tracestate`, if it has none) as request-header overrides, after `keys`
// (the other overridden headers).
function setTraceContextOverrides(responseHeaders, keys, traceContext) {
    responseHeaders.set(REQUEST_HEADER_PREFIX + 'traceparent', traceContext.traceparent);
    keys.push('traceparent');
    if (traceContext.tracestate) {
        responseHeaders.set(REQUEST_HEADER_PREFIX + 'tracestate', traceContext.tracestate);
        keys.push('tracestate');
    } else {
        responseHeaders.delete(REQUEST_HEADER_PREFIX + 'tracestate');
    }
    responseHeaders.set(OVERRIDE_HEADERS, keys.join(','));
}

//# sourceMappingURL=forward-trace-context.js.map