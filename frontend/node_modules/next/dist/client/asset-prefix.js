"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getAssetPrefix", {
    enumerable: true,
    get: function() {
        return getAssetPrefix;
    }
});
const _invarianterror = require("../shared/lib/invariant-error");
function getAssetPrefix() {
    const currentScript = document.currentScript;
    if (!(currentScript instanceof HTMLScriptElement)) {
        throw new _invarianterror.InvariantError(`Expected document.currentScript to be a <script> element. Received ${currentScript} instead.`);
    }
    const { pathname } = new URL(currentScript.src);
    const nextIndex = pathname.indexOf('/_next/');
    if (nextIndex === -1) {
        throw new _invarianterror.InvariantError(`Expected document.currentScript src to contain '/_next/'. Received ${currentScript.src} instead.`);
    }
    return pathname.slice(0, nextIndex);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=asset-prefix.js.map