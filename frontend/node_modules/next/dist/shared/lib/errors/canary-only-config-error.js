"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    CanaryOnlyConfigError: null,
    isStableBuild: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CanaryOnlyConfigError: function() {
        return CanaryOnlyConfigError;
    },
    isStableBuild: function() {
        return isStableBuild;
    }
});
function isStableBuild() {
    const nextVersion = "16.4.5";
    return !nextVersion?.includes('canary') && // Commit preview tarballs (e.g. `16.4.0-preview-84cee7e6-20260917`, see
    // scripts/set-preview-version.js) are built from arbitrary canary commits,
    // so they are not stable. Numbered preview releases published to npm
    // (e.g. `16.3.0-preview.10`) are stable.
    !nextVersion?.includes('-preview-') && !process.env.__NEXT_TEST_MODE && !process.env.NEXT_PRIVATE_LOCAL_DEV;
}
class CanaryOnlyConfigError extends Error {
    constructor(arg){
        if (typeof arg === 'object' && 'feature' in arg) {
            super(`The experimental feature "${arg.feature}" can only be enabled when using the latest canary version of Next.js.`);
        } else {
            super(arg);
        }
        // This error is meant to interrupt the server start/build process
        // but the stack trace isn't meaningful, as it points to internal code.
        this.stack = undefined;
    }
}

//# sourceMappingURL=canary-only-config-error.js.map