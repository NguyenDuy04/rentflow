// The concurrent-router-queue implementation of the navigator interface
// (navigator.ts). Callers must never import this module directly; when
// `experimental.concurrentRouterQueue` is enabled, imports of './navigator'
// resolve here at the bundler level (see create-compiler-aliases.ts and
// next_import_map.rs), and neither navigator.ts nor the sequential
// implementation is bundled at all.
//
// This module must remain free of side effects at module scope: in addition
// to the browser bundle, the navigator module graph is also compiled into
// the pre-compiled app-page runtime bundles (via app-render.tsx), where the
// bundler alias cannot reach. Only the browser copy's operations ever run.
//
// TODO: This is currently a stub. Every operation throws so that enabling
// the flag fails loudly instead of silently running the old implementation.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    hmrRefresh: null,
    navigate: null,
    push: null,
    refresh: null,
    replace: null,
    restore: null,
    traverse: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    hmrRefresh: function() {
        return hmrRefresh;
    },
    navigate: function() {
        return navigate;
    },
    push: function() {
        return push;
    },
    refresh: function() {
        return refresh;
    },
    replace: function() {
        return replace;
    },
    restore: function() {
        return restore;
    },
    traverse: function() {
        return traverse;
    }
});
// Keep in sync with the identical message in concurrent-call-server.ts, so
// all unimplemented behavior shares a single error (and error code).
function notImplemented() {
    throw new Error('Not implemented: this behavior is not yet supported when ' + '`experimental.concurrentRouterQueue` is enabled.');
}
function navigate(_href, _navigateType, _scrollBehavior, _linkInstanceRef, _transitionTypes, _prefetchIntent) {
    notImplemented();
}
function push(_href, _options) {
    notImplemented();
}
function replace(_href, _options) {
    notImplemented();
}
function traverse(_href, _historyState) {
    notImplemented();
}
function restore(_url, _historyState) {
    notImplemented();
}
function refresh() {
    notImplemented();
}
function hmrRefresh() {
    notImplemented();
}
// Type-only conformance check: this module must expose exactly the surface of
// the navigator interface. Fails to typecheck if a signature drifts. Compiles
// to `const _conformance = null` — no runtime effect.
const _conformance = null;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=concurrent-router-queue.js.map