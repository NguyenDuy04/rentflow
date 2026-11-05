"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    NestedDynamicUseCacheError: null,
    UNEXPECTED_CACHE_MISS_MESSAGE: null,
    UnexpectedCacheMissError: null,
    UseCacheDeadlockError: null,
    UseCacheTimeoutError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    NestedDynamicUseCacheError: function() {
        return NestedDynamicUseCacheError;
    },
    UNEXPECTED_CACHE_MISS_MESSAGE: function() {
        return UNEXPECTED_CACHE_MISS_MESSAGE;
    },
    UnexpectedCacheMissError: function() {
        return UnexpectedCacheMissError;
    },
    UseCacheDeadlockError: function() {
        return UseCacheDeadlockError;
    },
    UseCacheTimeoutError: function() {
        return UseCacheTimeoutError;
    }
});
class UseCacheTimeoutError extends Error {
    constructor(route){
        super(`Route "${route}": ` + `A \`"use cache"\` function took too long during prerendering. The most common cause is passing unresolved request-specific arguments, such as \`params\` or \`searchParams\`, into the cached function. Resolve the data before calling the function and pass only the values you need.\nLearn more: https://nextjs.org/docs/messages/next-request-in-use-cache`);
    }
}
class UseCacheDeadlockError extends Error {
    constructor(route){
        super(`Route "${route}": ` + `A \`"use cache"\` function is awaiting a promise created outside it. The same call completed when run in isolation, so a module-scoped value (often a top-level \`Map\` used to dedupe fetches) is most likely blocking it. \`"use cache"\` already dedupes calls with the same arguments. Remove the surrounding dedupe layer.\nLearn more: https://nextjs.org/docs/messages/next-request-in-use-cache`);
    }
}
class NestedDynamicUseCacheError extends Error {
    constructor(){
        super('This "use cache" has a dynamic cache life that was propagated to its parent.');
        this.name = 'Nested dynamic "use cache"';
    }
}
const UNEXPECTED_CACHE_MISS_MESSAGE = `Unexpected cache miss after cache warming phase during prerendering. This is likely caused by non-deterministic arguments that differ between the cache warming phase and the final prerender phase (e.g. unstable array order). Ensure that arguments passed to cached functions are deterministic.`;
class UnexpectedCacheMissError extends Error {
    constructor(route){
        super(`Route "${route}": ` + UNEXPECTED_CACHE_MISS_MESSAGE);
    }
}

//# sourceMappingURL=use-cache-errors.js.map