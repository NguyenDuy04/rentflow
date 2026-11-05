"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    navigation: null,
    prefetch: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    navigation: function() {
        return navigation;
    },
    prefetch: function() {
        return prefetch;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _dynamicrenderingutils = require("../dynamic-rendering-utils");
const _utils = require("./utils");
const _invarianterror = require("../../shared/lib/invariant-error");
const _stagedrendering = require("../app-render/staged-rendering");
function prefetch() {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workStore || !workUnitStore) {
        const callingExpression = 'prefetch';
        (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
    }
    if (!process.env.__NEXT_CACHE_COMPONENTS) {
        throw new Error(`Route ${workStore.route} used \`prefetch()\`, which requires Cache Components to be enabled. Learn more: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`);
    }
    if (!(0, _utils.isRequestApiAllowedInCurrentPhase)(workUnitStore)) {
        throw new Error(`Route ${workStore.route} used \`prefetch()\` inside \`after()\` while rendering. The \`prefetch()\` function is used to indicate the subsequent code must not run in the app shell, but \`after()\` executes after the request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`);
    }
    const stageVariants = _dynamicrenderingutils.RENDER_STAGES_BY_DATA_KIND.staticUrlData.prefetchApi;
    switch(workUnitStore.type){
        case 'prerender':
            {
                // Content below `prefetch()` is excluded from the shell, but it's
                // deliberately included in the static output (and thus in static
                // prefetches), so we only delay it until the static prefetch stage.
                // It resolves in `PrefetchStatic_prefetchApi`, one stage ahead of URL data,
                // so validation can attribute a blocking hole to `prefetch()`.
                const { stagedRendering } = workUnitStore;
                if (!stagedRendering) {
                    // Prospective prerender
                    // `prefetch()` will resolve in the final prerender, so resolve it here as well.
                    return Promise.resolve(undefined);
                } else {
                    // Final prerender
                    return stagedRendering.delayUntilStage(stageVariants.static, 'prefetch', undefined);
                }
            }
        case 'prerender-runtime':
            {
                // In a shell render, prefetch() doesn't resolve, because it doesn't reach
                // `PrefetchRuntime`. It'll resolve in a runtime prefetch, and in a runtime
                // prerender produced during a navigation.
                // Note that this does not mark the subtree as dynamic -- content guarded by
                // prefetch() is still considered cacheable.
                const { stagedRendering } = workUnitStore;
                const prefetchStage = stageVariants.runtime;
                if (!stagedRendering) {
                    // Prospective prerender
                    // Make sure we don't unblock content that won't be reached in the final prerender.
                    if (workUnitStore.finalStage < prefetchStage) {
                        return (0, _dynamicrenderingutils.makePrefetchHangingPromise)(workUnitStore.renderSignal, workStore.route, '`prefetch()`');
                    } else {
                        return Promise.resolve(undefined);
                    }
                } else {
                    // Final prerender
                    return stagedRendering.delayUntilStage(prefetchStage, 'prefetch', undefined);
                }
            }
        case 'request':
            {
                const { stagedRendering } = workUnitStore;
                if (stagedRendering) {
                    // We can either recover a static shell or a runtime shell, but not both.
                    (0, _dynamicrenderingutils.trackIncompatibleShellContent)(workUnitStore, '`prefetch()`');
                    const stage = stageVariants[workUnitStore.needsRuntimeShell ? 'runtime' // Match the timing of 'prerender-runtime'.
                     : 'static' // Match the timing of 'prerender'.
                    ];
                    return stagedRendering.delayUntilStage(stage, 'prefetch', undefined);
                }
                return Promise.resolve(undefined);
            }
        case 'cache':
            {
                const error = new Error(`Route ${workStore.route} used \`prefetch()\` inside "use cache". This is not currently supported. Instead, move the "use cache" directive to a function that's called below \`await prefetch()\`, so that the cached content is deferred to the prefetch without caching the stage boundary itself. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
                Error.captureStackTrace(error, prefetch);
                (0, _dynamicrenderingutils.applyOwnerStack)(error);
                workStore.invalidDynamicUsageError ??= error;
                throw error;
            }
        case 'private-cache':
            {
                const error = new Error(`Route ${workStore.route} used \`prefetch()\` inside "use cache: private". This is not currently supported. Instead, move the "use cache" directive to a function that's called below \`await prefetch()\`, so that the cached content is deferred to the prefetch without caching the stage boundary itself. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
                Error.captureStackTrace(error, prefetch);
                (0, _dynamicrenderingutils.applyOwnerStack)(error);
                workStore.invalidDynamicUsageError ??= error;
                throw error;
            }
        case 'unstable-cache':
            {
                throw new Error(`Route ${workStore.route} used \`prefetch()\` inside a function cached with \`unstable_cache()\`. The \`prefetch()\` function is used to indicate the subsequent code must not run in the app shell, but \`unstable_cache()\` caches must be able to be produced before a prefetch, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
            }
        case 'build-time-generator':
            {
                throw new Error(`Route ${workStore.route} used \`prefetch()\` inside \`${workUnitStore.functionName}\`. This is not supported because \`${workUnitStore.functionName}\` runs at build time without a prefetch. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`);
            }
        case 'prerender-client':
        case 'validation-client':
            {
                const exportName = '`prefetch`';
                throw new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`);
            }
        case 'prerender-legacy':
            {
                // NOTE: Should not be reachable, because we don't use this mode in cacheComponents,
                // which we require at the top
                throw new Error(`Route ${workStore.route} used \`prefetch()\`, which requires Cache Components to be enabled. Learn more: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`);
            }
        default:
            {
                workUnitStore;
                return Promise.resolve(undefined);
            }
    }
}
function navigation() {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workStore || !workUnitStore) {
        const callingExpression = 'navigation';
        (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
    }
    if (!process.env.__NEXT_CACHE_COMPONENTS) {
        throw new Error(`Route ${workStore.route} used \`navigation()\`, which requires Cache Components to be enabled. Learn more: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`);
    }
    if (!(0, _utils.isRequestApiAllowedInCurrentPhase)(workUnitStore)) {
        throw new Error(`Route ${workStore.route} used \`navigation()\` inside \`after()\` while rendering. The \`navigation()\` function is used to indicate the subsequent code must only run during an actual navigation, but \`after()\` executes after the request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`);
    }
    switch(workUnitStore.type){
        case 'prerender':
            {
                // Static prerenders are computed once and shared across many
                // clients, so there's no per-request prefetch cost to save by
                // deferring the content — it's deliberately included in the static
                // output (and thus in static prefetches).
                // However, it's excluded from the shell, and has to be separated from
                // prefetch(), so we have to delay it.
                const { stagedRendering } = workUnitStore;
                if (!stagedRendering) {
                    // Prospective prerender
                    // `navigation()` will resolve in the final prerender, so resolve it here as well.
                    return Promise.resolve(undefined);
                } else {
                    // Final prerender
                    return stagedRendering.delayUntilStage(_stagedrendering.RenderStage.NavigationStatic, 'navigation', undefined);
                }
            }
        case 'prerender-runtime':
            {
                // In a shell or runtime prefetch, navigation() doesn't resolve,
                // because they don't reach `NavigationRuntime`.
                // It'll only resolve in a runtime prerender produced during a navigation.
                // Note that this does not mark the subtree as dynamic -- content guarded by
                // navigation() is still considered cacheable.
                const { stagedRendering } = workUnitStore;
                const navigationStage = _stagedrendering.RenderStage.NavigationRuntime;
                if (!stagedRendering) {
                    // Prospective prerender
                    // Make sure we don't unblock content that won't be reached in the final prerender.
                    if (workUnitStore.finalStage < navigationStage) {
                        return (0, _dynamicrenderingutils.makeUntrackedHangingPromise)(workUnitStore.renderSignal, workStore.route, '`navigation()`');
                    } else {
                        return Promise.resolve(undefined);
                    }
                } else {
                    // Final prerender
                    return stagedRendering.delayUntilStage(navigationStage, 'navigation', undefined);
                }
            }
        case 'request':
            {
                const { stagedRendering } = workUnitStore;
                if (stagedRendering) {
                    // We can either recover a static shell or a runtime shell, but not both.
                    (0, _dynamicrenderingutils.trackIncompatibleShellContent)(workUnitStore, '`navigation()`');
                    const stage = workUnitStore.needsRuntimeShell ? _stagedrendering.RenderStage.NavigationRuntime // Match the timing of 'prerender-runtime'.
                     : _stagedrendering.RenderStage.NavigationStatic // Match the timing of 'prerender'.
                    ;
                    return stagedRendering.delayUntilStage(stage, 'navigation', undefined);
                }
                return Promise.resolve(undefined);
            }
        case 'cache':
            {
                const error = new Error(`Route ${workStore.route} used \`navigation()\` inside "use cache". This is not currently supported. Instead, move the "use cache" directive to a function that's called below \`await navigation()\`, so that the cached content is deferred to the navigation without caching the stage boundary itself. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
                Error.captureStackTrace(error, navigation);
                (0, _dynamicrenderingutils.applyOwnerStack)(error);
                workStore.invalidDynamicUsageError ??= error;
                throw error;
            }
        case 'private-cache':
            {
                const error = new Error(`Route ${workStore.route} used \`navigation()\` inside "use cache: private". This is not currently supported. Instead, move the "use cache" directive to a function that's called below \`await navigation()\`, so that the cached content is deferred to the navigation without caching the stage boundary itself. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
                Error.captureStackTrace(error, navigation);
                (0, _dynamicrenderingutils.applyOwnerStack)(error);
                workStore.invalidDynamicUsageError ??= error;
                throw error;
            }
        case 'unstable-cache':
            {
                throw new Error(`Route ${workStore.route} used \`navigation()\` inside a function cached with \`unstable_cache()\`. The \`navigation()\` function is used to indicate the subsequent code must only run during an actual navigation, but \`unstable_cache()\` caches must be able to be produced before a navigation, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
            }
        case 'build-time-generator':
            {
                throw new Error(`Route ${workStore.route} used \`navigation()\` inside \`${workUnitStore.functionName}\`. This is not supported because \`${workUnitStore.functionName}\` runs at build time without a navigation. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`);
            }
        case 'prerender-client':
        case 'validation-client':
            {
                const exportName = '`navigation`';
                throw new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`);
            }
        case 'prerender-legacy':
            {
                // NOTE: Should not be reachable, because we don't use this mode in cacheComponents,
                // which we require at the top
                throw new Error(`Route ${workStore.route} used \`navigation()\`, which requires Cache Components to be enabled. Learn more: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`);
            }
        default:
            {
                workUnitStore;
                return Promise.resolve(undefined);
            }
    }
}

//# sourceMappingURL=cache-stages.js.map