"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cacheLife", {
    enumerable: true,
    get: function() {
        return cacheLife;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _usecachemessages = require("./use-cache-messages");
const _cachelifeprofile = require("./cache-life-profile");
function cacheLife(profile) {
    if (!process.env.__NEXT_USE_CACHE) {
        throw new Error('`cacheLife()` is only available with the `cacheComponents` config.');
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
            throw (0, _usecachemessages.createCacheLifeOutsideUseCacheError)((_workAsyncStorage_getStore = _workasyncstorageexternal.workAsyncStorage.getStore()) == null ? void 0 : _workAsyncStorage_getStore.route);
        case 'cache':
        case 'private-cache':
            break;
        default:
            workUnitStore;
    }
    if (typeof profile === 'string') {
        const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
        if (!workStore) {
            throw new Error('`cacheLife()` can only be called during App Router rendering at the moment.');
        }
        // TODO: This should be globally available and not require an AsyncLocalStorage.
        const configuredProfile = workStore.cacheLifeProfiles[profile];
        if (configuredProfile === undefined) {
            if (workStore.cacheLifeProfiles[profile.trim()]) {
                throw new Error(`Unknown \`cacheLife()\` profile "${profile}" is not configured in next.config.js\n` + `Did you mean "${profile.trim()}" without the spaces?`);
            }
            throw new Error(`Unknown \`cacheLife()\` profile "${profile}" is not configured in next.config.js\n` + 'module.exports = {\n' + '  cacheLife: {\n' + `    "${profile}": ...\n` + '  }\n' + '}');
        }
        profile = configuredProfile;
    } else if (typeof profile !== 'object' || profile === null || Array.isArray(profile)) {
        throw new Error('Invalid `cacheLife()` option. Either pass a profile name or object.');
    } else {
        profile = (0, _cachelifeprofile.validateAndNormalizeCacheLifeProfile)(profile, {
            kind: 'inline'
        });
    }
    if (profile.revalidate !== undefined) {
        // Track the explicit revalidate time.
        if (workUnitStore.explicitRevalidate === undefined || workUnitStore.explicitRevalidate > profile.revalidate) {
            workUnitStore.explicitRevalidate = profile.revalidate;
        }
    }
    if (profile.expire !== undefined) {
        // Track the explicit expire time.
        if (workUnitStore.explicitExpire === undefined || workUnitStore.explicitExpire > profile.expire) {
            workUnitStore.explicitExpire = profile.expire;
        }
    }
    if (profile.stale !== undefined) {
        // Track the explicit stale time.
        if (workUnitStore.explicitStale === undefined || workUnitStore.explicitStale > profile.stale) {
            workUnitStore.explicitStale = profile.stale;
        }
    }
}

//# sourceMappingURL=cache-life.js.map