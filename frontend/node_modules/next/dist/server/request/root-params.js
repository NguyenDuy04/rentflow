"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getRootParam", {
    enumerable: true,
    get: function() {
        return getRootParam;
    }
});
const _invarianterror = require("../../shared/lib/invariant-error");
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _dynamicrenderingutils = require("../dynamic-rendering-utils");
const _dynamicaccessasyncstorageexternal = require("../app-render/dynamic-access-async-storage.external");
const _actionasyncstorageexternal = require("../app-render/action-async-storage.external");
const _varyparams = require("../app-render/vary-params");
function getRootParam(paramName) {
    const apiName = `\`import('next/root-params').${paramName}()\``;
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError(`Missing workStore in ${apiName}`);
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workUnitStore) {
        throw new Error(`Route ${workStore.route} used ${apiName} outside of a Server Component. This is not allowed.`);
    }
    const actionStore = _actionasyncstorageexternal.actionAsyncStorage.getStore();
    if (actionStore) {
        if (actionStore.isAppRoute) {
            // TODO(root-params): add support for route handlers
            throw new Error(`Route ${workStore.route} used ${apiName} inside a Route Handler. Support for this API in Route Handlers is planned for a future version of Next.js.`);
        }
        if (actionStore.isAction && workUnitStore.phase === 'action') {
            // Actions are not fundamentally tied to a route (even if they're always submitted from some page),
            // so root params would be inconsistent if an action is called from multiple roots.
            // Make sure we check if the phase is "action" - we should not error in the rerender
            // after an action revalidates or updates cookies (which will still have `actionStore.isAction === true`)
            throw new Error(`${apiName} was used inside a Server Action. This is not supported. Functions from 'next/root-params' can only be called in the context of a route.`);
        }
    }
    switch(workUnitStore.type){
        case 'unstable-cache':
            {
                throw new Error(`Route ${workStore.route} used ${apiName} inside \`unstable_cache\`. This is not supported. Use \`"use cache"\` instead.`);
            }
        case 'cache':
            {
                if (!workUnitStore.rootParams) {
                    throw new Error(`Route ${workStore.route} used ${apiName} inside \`"use cache"\` nested within \`unstable_cache\`. Root params are not available in this context.`);
                }
                workUnitStore.readRootParamNames.add(paramName);
                const prerenderStore = workUnitStore.fallbackRootParamsPrerender;
                if (prerenderStore !== null && prerenderStore.fallbackRouteParams !== null && prerenderStore.fallbackRouteParams.has(paramName)) {
                    return (0, _dynamicrenderingutils.trackPromiseUsed)((0, _dynamicrenderingutils.makeFallbackParamsHangingPromise)(prerenderStore.renderSignal, workStore.route, apiName, // Track access and cancel the cache together when consumed below.
                    null), ()=>{
                        (0, _dynamicrenderingutils.trackFallbackParamsAccessed)(prerenderStore, apiName);
                        // Like fallback `params`, an unknown root makes the whole cache
                        // invocation dynamic, even if it contains its own Suspense.
                        (0, _dynamicaccessasyncstorageexternal.abortOnDynamicAccess)('fallback-params', new Error(`Accessed fallback root parameter "${paramName}" during prerendering.`));
                    });
                }
                return Promise.resolve(workUnitStore.rootParams[paramName]);
            }
        case 'prerender':
        case 'prerender-legacy':
            {
                return createPrerenderRootParamPromise(paramName, workStore, workUnitStore, apiName);
            }
        case 'validation-client':
        case 'prerender-client':
            {
                throw new _invarianterror.InvariantError(`${apiName} must not be used within a client component. Next.js should be preventing ${apiName} from being included in client components statically, but did not in this case.`);
            }
        case 'request':
            {
                if (process.env.__NEXT_CACHE_COMPONENTS && workUnitStore.validationSamples) {
                    const { assertRootParamInSamples } = require('../app-render/instant-validation/instant-samples');
                    // If we error, make sure we return a rejected promise instead of erroring synchronously.
                    try {
                        assertRootParamInSamples(workStore, workUnitStore.validationSamples.params, paramName);
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }
                break;
            }
        case 'private-cache':
            {
                workUnitStore.readRootParamNames.add(paramName);
                return Promise.resolve(workUnitStore.rootParams[paramName]);
            }
        case 'prerender-runtime':
            {
                break;
            }
        case 'build-time-generator':
            {
                if (!(paramName in workUnitStore.rootParams)) {
                    if (workUnitStore.functionName !== 'generateStaticParams') {
                        throw new Error(`Route ${workStore.route} used ${apiName} inside \`${workUnitStore.functionName}\`, but the \`${paramName}\` parameter is not available in this build-time generator.`);
                    }
                    throw new Error(`Route ${workStore.route} used ${apiName} inside \`generateStaticParams\`, but the \`${paramName}\` parameter was not provided by a parent \`generateStaticParams\`. In \`generateStaticParams\`, root params are only available for segments nested below the segment that provides them.`);
                }
                break;
            }
        default:
            {
                workUnitStore;
            }
    }
    (0, _varyparams.accumulateRootVaryParam)(paramName);
    return Promise.resolve(workUnitStore.rootParams[paramName]);
}
function createPrerenderRootParamPromise(paramName, workStore, prerenderStore, apiName) {
    switch(prerenderStore.type){
        case 'prerender':
        case 'prerender-legacy':
        default:
    }
    const underlyingParams = prerenderStore.rootParams;
    switch(prerenderStore.type){
        case 'prerender':
            {
                // We are in a cacheComponents prerender.
                // The param is a fallback, so it should be treated as dynamic.
                if (prerenderStore.fallbackRouteParams && prerenderStore.fallbackRouteParams.has(paramName)) {
                    return (0, _dynamicrenderingutils.makeFallbackParamsHangingPromise)(prerenderStore.renderSignal, workStore.route, apiName, prerenderStore);
                }
                break;
            }
        case 'prerender-legacy':
            {
                break;
            }
        default:
            {
                prerenderStore;
            }
    }
    // If the param is not a fallback param, we just return the statically available value.
    (0, _varyparams.accumulateRootVaryParam)(paramName);
    return Promise.resolve(underlyingParams[paramName]);
}

//# sourceMappingURL=root-params.js.map