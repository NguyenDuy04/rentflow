// The concurrent implementation of callServer (app-call-server.ts). Callers
// must never import this module directly; when
// `experimental.concurrentRouterQueue` is enabled, imports of
// './app-call-server' resolve here at the bundler level (see
// create-compiler-aliases.ts and next_import_map.rs), and neither
// app-call-server.ts nor the sequential implementation is bundled at all.
//
// This module must remain free of side effects at module scope; see the note
// in concurrent-router-queue.ts.
//
// TODO: This is currently a stub. It throws so that enabling the flag fails
// loudly instead of silently running the old implementation.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "callServer", {
    enumerable: true,
    get: function() {
        return callServer;
    }
});
async function callServer(_actionId, _actionArgs) {
    // Keep in sync with the identical message in concurrent-router-queue.ts, so
    // all unimplemented behavior shares a single error (and error code).
    throw new Error('Not implemented: this behavior is not yet supported when ' + '`experimental.concurrentRouterQueue` is enabled.');
}
// Type-only conformance check: this module must expose exactly the surface of
// the app-call-server interface. Fails to typecheck if a signature drifts.
// Compiles to `const _conformance = null` — no runtime effect.
const _conformance = null;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=concurrent-call-server.js.map