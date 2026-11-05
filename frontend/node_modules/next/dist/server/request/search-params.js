"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createPrerenderSearchParamsForClientPage: null,
    createSearchParamsFromClient: null,
    createServerSearchParamsForMetadata: null,
    createServerSearchParamsForServerPage: null,
    makeErroringSearchParamsForUseCache: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createPrerenderSearchParamsForClientPage: function() {
        return createPrerenderSearchParamsForClientPage;
    },
    createSearchParamsFromClient: function() {
        return createSearchParamsFromClient;
    },
    createServerSearchParamsForMetadata: function() {
        return createServerSearchParamsForMetadata;
    },
    createServerSearchParamsForServerPage: function() {
        return createServerSearchParamsForServerPage;
    },
    makeErroringSearchParamsForUseCache: function() {
        return makeErroringSearchParamsForUseCache;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _varyparams = require("../app-render/vary-params");
const _reflect = require("../web/spec-extension/adapters/reflect");
const _dynamicrendering = require("../app-render/dynamic-rendering");
const _dynamicaccessasyncstorageexternal = require("../app-render/dynamic-access-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _invarianterror = require("../../shared/lib/invariant-error");
const _dynamicrenderingutils = require("../dynamic-rendering-utils");
const _creatededupedbycallsiteservererrorlogger = require("../create-deduped-by-callsite-server-error-logger");
const _reflectutils = require("../../shared/lib/utils/reflect-utils");
const _utils = require("./utils");
function createSearchParamsFromClient(underlyingSearchParams) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-client':
            case 'prerender-legacy':
                return createStaticPrerenderSearchParams(workStore, workUnitStore);
            case 'prerender-runtime':
                throw new _invarianterror.InvariantError('createSearchParamsFromClient should not be called in a runtime prerender.');
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                throw new _invarianterror.InvariantError('createSearchParamsFromClient should not be called in cache contexts.');
            case 'build-time-generator':
                throw new _invarianterror.InvariantError(`createSearchParamsFromClient should not be called inside ${workUnitStore.functionName}.`);
            case 'validation-client':
                {
                    if (workUnitStore.validationSamples) {
                        return createClientSearchParamsInValidation(underlyingSearchParams, workStore, workUnitStore);
                    }
                    return makeUntrackedSearchParams(underlyingSearchParams);
                }
            case 'request':
                return createRenderSearchParams(underlyingSearchParams, workStore, workUnitStore);
            default:
                workUnitStore;
        }
    }
    (0, _workunitasyncstorageexternal.throwInvariantForMissingStore)();
}
function createServerSearchParamsForMetadata(underlyingSearchParams) {
    const metadataVaryParamsAccumulator = (0, _varyparams.getMetadataVaryParamsAccumulator)();
    return createServerSearchParamsForServerPage(underlyingSearchParams, metadataVaryParamsAccumulator);
}
function createServerSearchParamsForServerPage(underlyingSearchParams, varyParamsAccumulator) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-client':
            case 'prerender-legacy':
                return createStaticPrerenderSearchParams(workStore, workUnitStore);
            case 'validation-client':
                throw new _invarianterror.InvariantError('createServerSearchParamsForServerPage should not be called in a client validation.');
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                throw new _invarianterror.InvariantError('createServerSearchParamsForServerPage should not be called in cache contexts.');
            case 'build-time-generator':
                throw new _invarianterror.InvariantError(`createServerSearchParamsForServerPage should not be called inside ${workUnitStore.functionName}.`);
            case 'prerender-runtime':
                return createRuntimePrerenderSearchParams(underlyingSearchParams, workStore, workUnitStore, varyParamsAccumulator);
            case 'request':
                return createRenderSearchParams(underlyingSearchParams, workStore, workUnitStore);
            default:
                workUnitStore;
        }
    }
    (0, _workunitasyncstorageexternal.throwInvariantForMissingStore)();
}
function createPrerenderSearchParamsForClientPage() {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    if (workStore.forceStatic) {
        // When using forceStatic we override all other logic and always just return an empty
        // dictionary object.
        return Promise.resolve({});
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-client':
                // We're prerendering in a mode that aborts (cacheComponents) and should stall
                // the promise to ensure the RSC side is considered dynamic
                return (0, _dynamicrenderingutils.makeURLDataHangingPromise)(workUnitStore.renderSignal, workStore.route, '`searchParams`', workUnitStore);
            case 'validation-client':
                throw new _invarianterror.InvariantError('createPrerenderSearchParamsForClientPage should not be called in a client validation.');
            case 'prerender-runtime':
                throw new _invarianterror.InvariantError('createPrerenderSearchParamsForClientPage should not be called in a runtime prerender.');
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                throw new _invarianterror.InvariantError('createPrerenderSearchParamsForClientPage should not be called in cache contexts.');
            case 'build-time-generator':
                throw new _invarianterror.InvariantError(`createPrerenderSearchParamsForClientPage should not be called inside ${workUnitStore.functionName}.`);
            case 'prerender-legacy':
            case 'request':
                return Promise.resolve({});
            default:
                workUnitStore;
        }
    }
    (0, _workunitasyncstorageexternal.throwInvariantForMissingStore)();
}
function createStaticPrerenderSearchParams(workStore, prerenderStore) {
    if (workStore.forceStatic) {
        // When using forceStatic we override all other logic and always just return an empty
        // dictionary object.
        return Promise.resolve({});
    }
    switch(prerenderStore.type){
        case 'prerender':
        case 'prerender-client':
            {
                // We are in a cacheComponents (PPR or otherwise) prerender
                return makeHangingSearchParams(workStore, prerenderStore);
            }
        case 'prerender-legacy':
            // We are in a legacy static generation and need to interrupt the
            // prerender when search params are accessed.
            return makeErroringSearchParams(workStore, prerenderStore);
        default:
            return prerenderStore;
    }
}
function createRuntimePrerenderSearchParams(underlyingSearchParams, workStore, workUnitStore, varyParamsAccumulator) {
    const userspaceSearchParams = varyParamsAccumulator !== null ? (0, _varyparams.createVaryingSearchParams)(varyParamsAccumulator, underlyingSearchParams) : underlyingSearchParams;
    const searchParamsStage = _dynamicrenderingutils.RENDER_STAGES_BY_DATA_KIND.runtimeUrlData;
    const { stagedRendering } = workUnitStore;
    if (!stagedRendering) {
        // If there's no stage controller, we're in a prospective runtime prerender.
        // Make sure we don't unblock content that won't be reached in the final prerender.
        if (workUnitStore.finalStage < searchParamsStage) {
            return makeHangingSearchParams(workStore, workUnitStore);
        } else {
            return makeUntrackedSearchParams(userspaceSearchParams);
        }
    }
    // If search params don't resolve in this prerender, caches need to treat them as a hanging input.
    if (stagedRendering.finalStage && stagedRendering.finalStage < searchParamsStage) {
        return makeHangingSearchParams(workStore, workUnitStore);
    } else {
        return stagedRendering.delayUntilStage(searchParamsStage, 'searchParams', userspaceSearchParams);
    }
}
function createRenderSearchParams(underlyingSearchParams, workStore, requestStore) {
    const { asyncApiPromises, validationSamples } = requestStore;
    if (asyncApiPromises) {
        let userspaceSearchParams = underlyingSearchParams;
        if (validationSamples) {
            userspaceSearchParams = createSearchParamsProxyForInstantValidation(workStore, validationSamples, underlyingSearchParams);
        }
        return createStagedRenderSearchParams(workStore, asyncApiPromises, underlyingSearchParams, userspaceSearchParams);
    }
    // No staged rendering = no cacheComponents, or cacheComponents prod without cachedNavigations
    if (workStore.forceStatic) {
        // When using forceStatic we override all other logic and always just return an empty
        // dictionary object.
        return Promise.resolve({});
    }
    if (process.env.NODE_ENV === 'development') {
        // Semantically we only need the dev tracking when running in `next dev`
        // but since you would never use next dev with production NODE_ENV we use this
        // as a proxy so we can statically exclude this code from production builds.
        return makeUntrackedSearchParamsWithDevWarnings(underlyingSearchParams, workStore, requestStore);
    } else {
        return makeUntrackedSearchParams(underlyingSearchParams);
    }
}
function createStagedRenderSearchParams(workStore, asyncApiPromises, underlyingSearchParams, userspaceSearchParams) {
    const trigger = asyncApiPromises.sharedSearchParamsParent;
    if (process.env.NODE_ENV === 'development') {
        // We wrap each instance of searchParams in a `new Promise()`.
        // This is important when all awaits are in third party which would otherwise
        // track all the way to the internal params.
        const promise = new Promise((resolve, reject)=>{
            trigger.then(()=>resolve(userspaceSearchParams), reject);
        });
        // @ts-expect-error
        promise.displayName = 'searchParams';
        promise.catch(ignoreReject);
        return instrumentSearchParamsPromiseWithDevWarnings(underlyingSearchParams, promise, workStore);
    } else {
        return (0, _dynamicrenderingutils.makePromiseFromTrigger)(trigger, userspaceSearchParams);
    }
}
function createSearchParamsProxyForInstantValidation(workStore, validationSamples, underlyingSearchParams) {
    const { createExhaustiveSearchParamsProxy } = require('../app-render/instant-validation/instant-samples');
    const declaredKeys = new Set(Object.keys(validationSamples.searchParams ?? {}));
    return createExhaustiveSearchParamsProxy(underlyingSearchParams, declaredKeys, workStore.route);
}
const CachedSearchParams = new WeakMap();
const CachedSearchParamsForUseCache = new WeakMap();
function makeHangingSearchParams(workStore, prerenderStore) {
    const cachedSearchParams = CachedSearchParams.get(prerenderStore);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const promise = (0, _dynamicrenderingutils.makeURLDataHangingPromise)(prerenderStore.renderSignal, workStore.route, '`searchParams`', // Passing `null` for the store disables tracking of params usage.
    // We want accesses of chained promises to be tracked as well.
    // TODO: The custom tracking seems unnecessary, we should standardize it
    null);
    const trackSearchParamsAccessed = ()=>{
        // Record against the store that's active at access time: the promise is
        // created while the RSC payload is constructed, but typically accessed
        // later, during the render, under a different store.
        const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
        (0, _dynamicrenderingutils.trackURLDataAccessed)(workUnitStore ?? prerenderStore, '`searchParams`');
    };
    const proxyHandler = {
        get (target, prop, receiver) {
            if (Object.hasOwn(target, prop)) {
                // The promise has this property directly. we must return it.
                // We know it isn't a dynamic access because it can only be something
                // that was previously written to the promise and thus not an underlying searchParam value
                return _reflect.ReflectAdapter.get(target, prop, receiver);
            }
            switch(prop){
                case 'then':
                case 'catch':
                case 'finally':
                    {
                        const originalMethod = _reflect.ReflectAdapter.get(target, prop, receiver);
                        return ({
                            [prop]: (...args)=>{
                                const expression = '`await searchParams`, `searchParams.then`, or similar';
                                trackSearchParamsAccessed();
                                (0, _dynamicrendering.annotateDynamicAccess)(expression, prerenderStore);
                                // Mirror `makeHangingParams`: when this never-resolving promise
                                // is awaited while a `use cache` key is being encoded
                                // (dynamicAccessAsyncStorage is set), abort so the surrounding
                                // cache bails out to a dynamic hole instead of hanging on it.
                                // Without this, a private cache that reads `searchParams` would
                                // stall the App Shell cache-warming render. Re-wrapping the
                                // result propagates the same behavior to promises derived via
                                // `.then`/`.catch`/`.finally` that are then passed into a cache.
                                (0, _dynamicaccessasyncstorageexternal.abortOnDynamicAccess)('runtime', new Error('Accessed `searchParams` during prerendering.'));
                                return new Proxy(originalMethod.apply(target, args), proxyHandler);
                            }
                        })[prop];
                    }
                case 'status':
                    {
                        const expression = '`use(searchParams)`, `searchParams.status`, or similar';
                        trackSearchParamsAccessed();
                        (0, _dynamicrendering.annotateDynamicAccess)(expression, prerenderStore);
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                    }
                default:
                    {
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                    }
            }
        }
    };
    const proxiedPromise = new Proxy(promise, proxyHandler);
    CachedSearchParams.set(prerenderStore, proxiedPromise);
    return proxiedPromise;
}
function makeErroringSearchParams(workStore, prerenderStore) {
    const cachedSearchParams = CachedSearchParams.get(workStore);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const underlyingSearchParams = {};
    // For search params we don't construct a ReactPromise because we want to interrupt
    // rendering on any property access that was not set from outside and so we only want
    // to have properties like value and status if React sets them.
    const promise = Promise.resolve(underlyingSearchParams);
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            if (Object.hasOwn(promise, prop)) {
                // The promise has this property directly. we must return it.
                // We know it isn't a dynamic access because it can only be something
                // that was previously written to the promise and thus not an underlying searchParam value
                return _reflect.ReflectAdapter.get(target, prop, receiver);
            }
            if (typeof prop === 'string' && prop === 'then') {
                const expression = '`await searchParams`, `searchParams.then`, or similar';
                if (workStore.dynamicShouldError) {
                    (0, _utils.throwWithStaticGenerationBailoutErrorWithDynamicError)(workStore.route, expression);
                } else {
                    // Legacy Prerender
                    (0, _dynamicrendering.throwToInterruptStaticGeneration)(expression, workStore, prerenderStore);
                }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    });
    CachedSearchParams.set(workStore, proxiedPromise);
    return proxiedPromise;
}
function makeErroringSearchParamsForUseCache() {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    const cachedSearchParams = CachedSearchParamsForUseCache.get(workStore);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const promise = Promise.resolve({});
    const proxiedPromise = new Proxy(promise, {
        get: function get(target, prop, receiver) {
            if (Object.hasOwn(promise, prop)) {
                // The promise has this property directly. we must return it. We know it
                // isn't a dynamic access because it can only be something that was
                // previously written to the promise and thus not an underlying
                // searchParam value
                return _reflect.ReflectAdapter.get(target, prop, receiver);
            }
            if (typeof prop === 'string' && (prop === 'then' || !_reflectutils.wellKnownProperties.has(prop))) {
                (0, _utils.throwForSearchParamsAccessInUseCache)(workStore, get);
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    });
    CachedSearchParamsForUseCache.set(workStore, proxiedPromise);
    return proxiedPromise;
}
function makeUntrackedSearchParams(underlyingSearchParams) {
    const cachedSearchParams = CachedSearchParams.get(underlyingSearchParams);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const promise = Promise.resolve(underlyingSearchParams);
    CachedSearchParams.set(underlyingSearchParams, promise);
    return promise;
}
function makeUntrackedSearchParamsWithDevWarnings(underlyingSearchParams, workStore, requestStore) {
    const cachedSearchParams = CachedSearchParams.get(underlyingSearchParams);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const promise = makeUntrackedSearchParamsWithDevWarningsImpl(underlyingSearchParams, workStore, requestStore);
    CachedSearchParams.set(requestStore, promise);
    return promise;
}
function makeUntrackedSearchParamsWithDevWarningsImpl(underlyingSearchParams, workStore, requestStore) {
    const promiseInitialized = {
        current: false
    };
    const proxiedUnderlying = instrumentSearchParamsObjectWithDevWarnings(underlyingSearchParams, workStore, promiseInitialized);
    const promise = (0, _dynamicrenderingutils.makeDevtoolsIOAwarePromise)(proxiedUnderlying, requestStore, _dynamicrenderingutils.RENDER_STAGES_BY_DATA_KIND.runtimeUrlData);
    promise.then(()=>{
        promiseInitialized.current = true;
    }, // If we're in staged rendering, this promise will reject if the render
    // is aborted before it can reach the PrefetchRuntime stage.
    // In that case, we have to prevent an unhandled rejection from the promise
    // created by this `.then()` call.
    // This does not affect the `promiseInitialized` logic above,
    // because `proxiedUnderlying` will not be used to resolve the promise,
    // so there's no risk of any of its properties being accessed and triggering
    // an undesireable warning.
    ignoreReject);
    return instrumentSearchParamsPromiseWithDevWarnings(underlyingSearchParams, promise, workStore);
}
function ignoreReject() {}
function instrumentSearchParamsObjectWithDevWarnings(underlyingSearchParams, workStore, promiseInitialized) {
    // We have an unfortunate sequence of events that requires this initialization logic. We want to instrument the underlying
    // searchParams object to detect if you are accessing values in dev. This is used for warnings and for things like the static prerender
    // indicator. However when we pass this proxy to our Promise.resolve() below the VM checks if the resolved value is a promise by looking
    // at the `.then` property. To our dynamic tracking logic this is indistinguishable from a `then` searchParam and so we would normally trigger
    // dynamic tracking. However we know that this .then is not real dynamic access, it's just how thenables resolve in sequence. So we introduce
    // this initialization concept so we omit the dynamic check until after we've constructed our resolved promise.
    return new Proxy(underlyingSearchParams, {
        get (target, prop, receiver) {
            if (typeof prop === 'string' && promiseInitialized.current) {
                if (workStore.dynamicShouldError) {
                    const expression = (0, _reflectutils.describeStringPropertyAccess)('searchParams', prop);
                    (0, _utils.throwWithStaticGenerationBailoutErrorWithDynamicError)(workStore.route, expression);
                }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        },
        has (target, prop) {
            if (typeof prop === 'string') {
                if (workStore.dynamicShouldError) {
                    const expression = (0, _reflectutils.describeHasCheckingStringProperty)('searchParams', prop);
                    (0, _utils.throwWithStaticGenerationBailoutErrorWithDynamicError)(workStore.route, expression);
                }
            }
            return Reflect.has(target, prop);
        },
        ownKeys (target) {
            if (workStore.dynamicShouldError) {
                const expression = '`{...searchParams}`, `Object.keys(searchParams)`, or similar';
                (0, _utils.throwWithStaticGenerationBailoutErrorWithDynamicError)(workStore.route, expression);
            }
            return Reflect.ownKeys(target);
        }
    });
}
function instrumentSearchParamsPromiseWithDevWarnings(underlyingSearchParams, promise, workStore) {
    // Track which properties we should warn for.
    const proxiedProperties = new Set();
    Object.keys(underlyingSearchParams).forEach((prop)=>{
        if (_reflectutils.wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            proxiedProperties.add(prop);
        }
    });
    return new Proxy(promise, {
        get (target, prop, receiver) {
            if (prop === 'then' && workStore.dynamicShouldError) {
                const expression = '`searchParams.then`';
                (0, _utils.throwWithStaticGenerationBailoutErrorWithDynamicError)(workStore.route, expression);
            }
            if (typeof prop === 'string') {
                if (!_reflectutils.wellKnownProperties.has(prop) && (proxiedProperties.has(prop) || // We are accessing a property that doesn't exist on the promise nor
                // the underlying searchParams.
                Reflect.has(target, prop) === false)) {
                    const expression = (0, _reflectutils.describeStringPropertyAccess)('searchParams', prop);
                    warnForSyncAccess(workStore.route, expression);
                }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        },
        set (target, prop, value, receiver) {
            if (typeof prop === 'string') {
                proxiedProperties.delete(prop);
            }
            return Reflect.set(target, prop, value, receiver);
        },
        has (target, prop) {
            if (typeof prop === 'string') {
                if (!_reflectutils.wellKnownProperties.has(prop) && (proxiedProperties.has(prop) || // We are accessing a property that doesn't exist on the promise nor
                // the underlying searchParams.
                Reflect.has(target, prop) === false)) {
                    const expression = (0, _reflectutils.describeHasCheckingStringProperty)('searchParams', prop);
                    warnForSyncAccess(workStore.route, expression);
                }
            }
            return Reflect.has(target, prop);
        },
        ownKeys (target) {
            const expression = '`Object.keys(searchParams)` or similar';
            warnForSyncAccess(workStore.route, expression);
            return Reflect.ownKeys(target);
        }
    });
}
const warnForSyncAccess = (0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createSearchAccessError);
function createSearchAccessError(route, expression) {
    const prefix = route ? `Route "${route}" ` : 'This route ';
    return new Error(`${prefix}used ${expression}. ` + `\`searchParams\` is a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
}
function createClientSearchParamsInValidation(underlyingSearchParams, workStore, workUnitStore) {
    var _workUnitStore_validationSamples;
    const { createExhaustiveSearchParamsProxy } = require('../app-render/instant-validation/instant-samples');
    const declaredKeys = new Set(Object.keys(((_workUnitStore_validationSamples = workUnitStore.validationSamples) == null ? void 0 : _workUnitStore_validationSamples.searchParams) ?? {}));
    underlyingSearchParams = createExhaustiveSearchParamsProxy(underlyingSearchParams, declaredKeys, workStore.route);
    return Promise.resolve(underlyingSearchParams);
}

//# sourceMappingURL=search-params.js.map