"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    isRequestApiAllowedInCurrentPhase: null,
    throwForSearchParamsAccessInUseCache: null,
    throwWithStaticGenerationBailoutErrorWithDynamicError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isRequestApiAllowedInCurrentPhase: function() {
        return isRequestApiAllowedInCurrentPhase;
    },
    throwForSearchParamsAccessInUseCache: function() {
        return throwForSearchParamsAccessInUseCache;
    },
    throwWithStaticGenerationBailoutErrorWithDynamicError: function() {
        return throwWithStaticGenerationBailoutErrorWithDynamicError;
    }
});
const _staticgenerationbailout = require("../../client/components/static-generation-bailout");
const _actionasyncstorageexternal = require("../app-render/action-async-storage.external");
const _aftertaskasyncstorageexternal = require("../app-render/after-task-async-storage.external");
const _usecachemessages = require("../use-cache/use-cache-messages");
function throwWithStaticGenerationBailoutErrorWithDynamicError(route, expression) {
    throw new _staticgenerationbailout.StaticGenBailoutError(`Route ${route} with \`dynamic = "error"\` couldn't be rendered statically because it used ${expression}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`);
}
function throwForSearchParamsAccessInUseCache(workStore, constructorOpt) {
    const error = (0, _usecachemessages.createSearchParamsInUseCacheError)(workStore.route);
    Error.captureStackTrace(error, constructorOpt);
    workStore.invalidDynamicUsageError ??= error;
    throw error;
}
function isRequestApiAllowedInCurrentPhase(workUnitStore) {
    switch(workUnitStore.phase){
        case 'action':
        case 'render':
            {
                // The request is still in progress. The API may be disallowed for other reasons,
                // but not because of phase.
                return true;
            }
        case 'after':
            {
                // The request has finished.
                // If we're in a Route Handler or a Server Action,
                // request APIs can be called everywhere, even in after().
                const actionStore = _actionasyncstorageexternal.actionAsyncStorage.getStore();
                if (actionStore && (actionStore.isAppRoute || actionStore.isAction)) {
                    return true;
                }
                const afterTaskStore = _aftertaskasyncstorageexternal.afterTaskAsyncStorage.getStore();
                if (afterTaskStore) {
                    // We're in an `after` callback. Request APIs are callable if
                    // the `after()` call happened in an action phase:
                    // - in a Route Handler
                    // - in a Server Action's body (but not the render after)
                    //
                    // TODO(after): Is it even possible to have `phase === 'action'` but no `actionStore`?
                    // We should revisit this setup and simplify this.
                    return afterTaskStore.rootTaskSpawnPhase === 'action';
                }
                // Otherwise, we must be in a page, in the `after` phase.
                // We don't allow calling request APIs here because we'd miss
                // them during prerendering and wouldn't know that the page is dynamic.
                return false;
            }
    }
}

//# sourceMappingURL=utils.js.map