"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createServerPathnameForMetadata", {
    enumerable: true,
    get: function() {
        return createServerPathnameForMetadata;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _dynamicrenderingutils = require("../dynamic-rendering-utils");
const _invarianterror = require("../../shared/lib/invariant-error");
function createServerPathnameForMetadata(underlyingPathname) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-legacy':
                {
                    return createPrerenderPathname(underlyingPathname, workStore, workUnitStore);
                }
            case 'prerender-client':
            case 'validation-client':
                throw new _invarianterror.InvariantError('createServerPathnameForMetadata should not be called in client contexts.');
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                throw new _invarianterror.InvariantError('createServerPathnameForMetadata should not be called in cache contexts.');
            case 'build-time-generator':
                throw new _invarianterror.InvariantError(`createServerPathnameForMetadata should not be called inside ${workUnitStore.functionName}.`);
            case 'prerender-runtime':
                {
                    // TODO(app-shells): whether or not this is included in the shell
                    // should depend on whether this route has params.
                    // if there's no params, it can be included.
                    // for now, we defensively exclude it to match the earlier pessimistic
                    // behavior of always resolving in the PrefetchRuntime stage
                    // (i.e. assuming that we have non-static params in the pathname)
                    const { stagedRendering } = workUnitStore;
                    const pathnameStage = _dynamicrenderingutils.RENDER_STAGES_BY_DATA_KIND.runtimeUrlData;
                    if (stagedRendering) {
                        return stagedRendering.delayUntilStage(pathnameStage, undefined, underlyingPathname);
                    } else {
                        if (workUnitStore.finalStage < pathnameStage) {
                            return (0, _dynamicrenderingutils.makeDynamicHangingPromise)(workUnitStore.renderSignal, workStore.route, '`pathname`');
                        } else {
                            return createRenderPathname(underlyingPathname);
                        }
                    }
                }
            case 'request':
                // TODO(app-shells): this should be delayed if there's non-static params
                return createRenderPathname(underlyingPathname);
            default:
                workUnitStore;
        }
    }
    (0, _workunitasyncstorageexternal.throwInvariantForMissingStore)();
}
function createPrerenderPathname(underlyingPathname, workStore, prerenderStore) {
    switch(prerenderStore.type){
        case 'prerender':
            {
                const fallbackParams = prerenderStore.fallbackRouteParams;
                if (fallbackParams && fallbackParams.size > 0) {
                    // The pathname depends on params, so we track it like a fallback params access.
                    return (0, _dynamicrenderingutils.makeFallbackParamsHangingPromise)(prerenderStore.renderSignal, workStore.route, '`pathname`', prerenderStore);
                }
                break;
            }
        case 'prerender-legacy':
            break;
        default:
            prerenderStore;
    }
    // We don't have any fallback params so we have an entirely static safe params object
    return Promise.resolve(underlyingPathname);
}
function createRenderPathname(underlyingPathname) {
    return Promise.resolve(underlyingPathname);
}

//# sourceMappingURL=pathname.js.map