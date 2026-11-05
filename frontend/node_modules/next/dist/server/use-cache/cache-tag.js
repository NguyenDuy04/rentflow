"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cacheTag", {
    enumerable: true,
    get: function() {
        return cacheTag;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _patchfetch = require("../lib/patch-fetch");
const _usecachemessages = require("./use-cache-messages");
function cacheTag(...tags) {
    if (!process.env.__NEXT_USE_CACHE) {
        throw new Error('`cacheTag()` is only available with the `cacheComponents` config.');
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    switch(workUnitStore == null ? void 0 : workUnitStore.type){
        case 'prerender':
        case 'prerender-client':
        case 'validation-client':
        case 'prerender-runtime':
        case 'prerender-legacy':
        case 'request':
        case 'unstable-cache':
        case 'build-time-generator':
        case undefined:
            var _workAsyncStorage_getStore;
            throw (0, _usecachemessages.createCacheTagOutsideUseCacheError)((_workAsyncStorage_getStore = _workasyncstorageexternal.workAsyncStorage.getStore()) == null ? void 0 : _workAsyncStorage_getStore.route);
        case 'cache':
        case 'private-cache':
            break;
        default:
            workUnitStore;
    }
    const validTags = (0, _patchfetch.validateTags)(tags, '`cacheTag()`');
    if (!workUnitStore.tags) {
        workUnitStore.tags = validTags;
    } else {
        workUnitStore.tags.push(...validTags);
    }
}

//# sourceMappingURL=cache-tag.js.map