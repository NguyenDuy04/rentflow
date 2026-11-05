"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    abortOnDynamicAccess: null,
    dynamicAccessAsyncStorage: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    abortOnDynamicAccess: function() {
        return abortOnDynamicAccess;
    },
    dynamicAccessAsyncStorage: function() {
        return _dynamicaccessasyncstorageinstance.dynamicAccessAsyncStorageInstance;
    }
});
const _dynamicaccessasyncstorageinstance = require("./dynamic-access-async-storage-instance");
function abortOnDynamicAccess(reason, error) {
    const store = _dynamicaccessasyncstorageinstance.dynamicAccessAsyncStorageInstance.getStore();
    if (store !== undefined) {
        // A cache may read both kinds of data before cancellation finishes. Only
        // fallback-only dependencies can become static when the params are known.
        if (store.reason !== 'runtime') {
            store.reason = reason;
        }
        store.abortController.abort(error);
    }
}

//# sourceMappingURL=dynamic-access-async-storage.external.js.map