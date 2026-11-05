"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    allParamsAreRootParams: null,
    hasFallbackRouteParams: null,
    isEmptyParams: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    allParamsAreRootParams: function() {
        return allParamsAreRootParams;
    },
    hasFallbackRouteParams: function() {
        return hasFallbackRouteParams;
    },
    isEmptyParams: function() {
        return isEmptyParams;
    }
});
function allParamsAreRootParams(underlyingParams, rootParams) {
    for(const paramName in underlyingParams){
        if (!Object.hasOwn(rootParams, paramName)) {
            return false;
        }
    }
    return true;
}
function isEmptyParams(params) {
    for(const _paramKey in params){
        return false;
    }
    return true;
}
function hasFallbackRouteParams(underlyingParams, fallbackParams) {
    if (fallbackParams) {
        for(let key in underlyingParams){
            if (fallbackParams.has(key)) {
                return true;
            }
        }
    }
    return false;
}

//# sourceMappingURL=params-utils.js.map