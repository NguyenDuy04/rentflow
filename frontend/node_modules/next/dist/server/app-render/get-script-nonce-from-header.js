"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getScriptNonceFromHeader: null,
    getScriptNonceFromHeaders: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getScriptNonceFromHeader: function() {
        return getScriptNonceFromHeader;
    },
    getScriptNonceFromHeaders: function() {
        return getScriptNonceFromHeaders;
    }
});
const CSP_NONCE_SOURCE_REGEX = /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/;
function getScriptNonceFromHeaders(headers) {
    const csp = headers['content-security-policy'] || headers['content-security-policy-report-only'];
    return typeof csp === 'string' ? getScriptNonceFromHeader(csp) : undefined;
}
function getScriptNonceFromHeader(cspHeaderValue) {
    const directives = cspHeaderValue// Directives are split by ';'.
    .split(';').map((directive)=>directive.trim());
    // First try to find the directive for the 'script-src', otherwise try to
    // fallback to the 'default-src'.
    const directive = directives.find((dir)=>dir.startsWith('script-src')) || directives.find((dir)=>dir.startsWith('default-src'));
    // If no directive could be found, then we're done.
    if (!directive) {
        return;
    }
    // Extract the first valid nonce from the directive. Malformed nonces are
    // ignored so the request can continue without a nonce instead of failing.
    for (const source of directive.split(/\s+/).slice(1)){
        const match = source.trim().match(CSP_NONCE_SOURCE_REGEX);
        if (match) {
            return match[1];
        }
    }
}

//# sourceMappingURL=get-script-nonce-from-header.js.map