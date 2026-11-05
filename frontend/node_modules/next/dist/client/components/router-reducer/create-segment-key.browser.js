"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createHeadKey: null,
    createSegmentKey: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createHeadKey: function() {
        return createHeadKey;
    },
    createSegmentKey: function() {
        return _createroutercachekey.createRouterCacheKey;
    }
});
const _createroutercachekey = require("./create-router-cache-key");
function createHeadKey(varyPath) {
    // Encode the parts as a JSON array rather than joining them. A catch-all
    // value and a search string can both contain `/`, so joined strings from
    // different params could be the same.
    const parts = [
        varyPath.value
    ];
    let params = varyPath.parent;
    while(params !== null){
        const value = params.value;
        if (typeof value === 'string') {
            parts.push(value);
        }
        params = params.parent;
    }
    return JSON.stringify(parts);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=create-segment-key.browser.js.map