'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useImageConfig", {
    enumerable: true,
    get: function() {
        return useImageConfig;
    }
});
const _react = require("react");
const _imageconfig = require("../shared/lib/image-config");
const _imageconfigcontextsharedruntime = require("../shared/lib/image-config-context.shared-runtime");
// This is replaced by the bundler define plugin.
const configEnv = process.env.__NEXT_IMAGE_OPTS;
function useImageConfig() {
    const configContext = (0, _react.useContext)(_imageconfigcontextsharedruntime.ImageConfigContext);
    return (0, _imageconfig.prepareImageConfig)(configEnv, configContext);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-image-config.js.map