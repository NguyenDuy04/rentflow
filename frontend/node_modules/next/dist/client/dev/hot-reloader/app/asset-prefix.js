"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assetPrefix", {
    enumerable: true,
    get: function() {
        return assetPrefix;
    }
});
const _assetprefix = require("../../../asset-prefix");
const assetPrefix = typeof window === 'undefined' ? '' : (0, _assetprefix.getAssetPrefix)();

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=asset-prefix.js.map