/**
 * Centralized error factories for cached function and revalidation misuse.
 * State the scope and constraint, explain non-obvious boundaries, give the
 * immediate fix, then link to the relevant docs.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createCacheLifeOutsideUseCacheError: null,
    createCacheTagOutsideUseCacheError: null,
    createConnectionInPrivateUseCacheError: null,
    createConnectionInPublicUseCacheError: null,
    createConnectionInUnstableCacheError: null,
    createCookiesInUnstableCacheError: null,
    createCookiesInUseCacheError: null,
    createDraftModeMutationInUnstableCacheError: null,
    createDraftModeMutationInUseCacheError: null,
    createHeadersInUnstableCacheError: null,
    createHeadersInUseCacheError: null,
    createNestedCacheShortExpireError: null,
    createNestedCacheZeroRevalidateError: null,
    createRevalidateDuringRenderError: null,
    createRevalidateInBuildTimeGeneratorError: null,
    createRevalidateInCachedFunctionError: null,
    createRouteHandlerRequestInUnstableCacheError: null,
    createRouteHandlerRequestInUseCacheError: null,
    createSearchParamsInUseCacheError: null,
    createUseCachePrivateInsidePublicUseCacheError: null,
    createUseCachePrivateInsideUnstableCacheError: null,
    createUseCachePrivateOutsideRequestContextError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createCacheLifeOutsideUseCacheError: function() {
        return createCacheLifeOutsideUseCacheError;
    },
    createCacheTagOutsideUseCacheError: function() {
        return createCacheTagOutsideUseCacheError;
    },
    createConnectionInPrivateUseCacheError: function() {
        return createConnectionInPrivateUseCacheError;
    },
    createConnectionInPublicUseCacheError: function() {
        return createConnectionInPublicUseCacheError;
    },
    createConnectionInUnstableCacheError: function() {
        return createConnectionInUnstableCacheError;
    },
    createCookiesInUnstableCacheError: function() {
        return createCookiesInUnstableCacheError;
    },
    createCookiesInUseCacheError: function() {
        return createCookiesInUseCacheError;
    },
    createDraftModeMutationInUnstableCacheError: function() {
        return createDraftModeMutationInUnstableCacheError;
    },
    createDraftModeMutationInUseCacheError: function() {
        return createDraftModeMutationInUseCacheError;
    },
    createHeadersInUnstableCacheError: function() {
        return createHeadersInUnstableCacheError;
    },
    createHeadersInUseCacheError: function() {
        return createHeadersInUseCacheError;
    },
    createNestedCacheShortExpireError: function() {
        return createNestedCacheShortExpireError;
    },
    createNestedCacheZeroRevalidateError: function() {
        return createNestedCacheZeroRevalidateError;
    },
    createRevalidateDuringRenderError: function() {
        return createRevalidateDuringRenderError;
    },
    createRevalidateInBuildTimeGeneratorError: function() {
        return createRevalidateInBuildTimeGeneratorError;
    },
    createRevalidateInCachedFunctionError: function() {
        return createRevalidateInCachedFunctionError;
    },
    createRouteHandlerRequestInUnstableCacheError: function() {
        return createRouteHandlerRequestInUnstableCacheError;
    },
    createRouteHandlerRequestInUseCacheError: function() {
        return createRouteHandlerRequestInUseCacheError;
    },
    createSearchParamsInUseCacheError: function() {
        return createSearchParamsInUseCacheError;
    },
    createUseCachePrivateInsidePublicUseCacheError: function() {
        return createUseCachePrivateInsidePublicUseCacheError;
    },
    createUseCachePrivateInsideUnstableCacheError: function() {
        return createUseCachePrivateInsideUnstableCacheError;
    },
    createUseCachePrivateOutsideRequestContextError: function() {
        return createUseCachePrivateOutsideRequestContextError;
    }
});
const NEXT_REQUEST_IN_USE_CACHE = 'https://nextjs.org/docs/messages/next-request-in-use-cache';
const UNSTABLE_CACHE_API_DOCS = 'https://nextjs.org/docs/app/api-reference/functions/unstable_cache';
const USE_CACHE_PRIVATE_API_DOCS = 'https://nextjs.org/docs/app/api-reference/directives/use-cache-private';
const CACHE_TAG_OUTSIDE_USE_CACHE = 'https://nextjs.org/docs/messages/cache-tag-outside-use-cache';
const CACHE_LIFE_OUTSIDE_USE_CACHE = 'https://nextjs.org/docs/messages/cache-life-outside-use-cache';
const USE_CACHE_PRIVATE_COMPOSITION = 'https://nextjs.org/docs/messages/use-cache-private-composition';
const REVALIDATE_IN_USE_CACHE = 'https://nextjs.org/docs/messages/revalidate-in-use-cache';
const NESTED_USE_CACHE_NO_EXPLICIT_CACHELIFE = 'https://nextjs.org/docs/messages/nested-use-cache-no-explicit-cachelife';
function createCookiesInUseCacheError(route) {
    return new Error(`Route "${route}": \`cookies()\` can't be read inside \`"use cache"\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createCookiesInUnstableCacheError(route) {
    return new Error(`Route "${route}": \`cookies()\` can't be read inside \`unstable_cache()\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${UNSTABLE_CACHE_API_DOCS}`);
}
function createHeadersInUseCacheError(route) {
    return new Error(`Route "${route}": \`headers()\` can't be read inside \`"use cache"\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createHeadersInUnstableCacheError(route) {
    return new Error(`Route "${route}": \`headers()\` can't be read inside \`unstable_cache()\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${UNSTABLE_CACHE_API_DOCS}`);
}
function createSearchParamsInUseCacheError(route) {
    return new Error(`Route "${route}": \`searchParams\` can't be read inside \`"use cache"\`. Await it outside the cached function and pass what you need as an argument.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createConnectionInPublicUseCacheError(route) {
    return new Error(`Route "${route}": \`connection()\` can't be called inside \`"use cache"\` because cached functions may run during prerendering, without an incoming request. Call it outside the cached function.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createConnectionInPrivateUseCacheError(route) {
    return new Error(`Route "${route}": \`connection()\` can't be called inside \`"use cache: private"\` because private cached functions may run during prefetching, without a navigation request. Call it outside the cached function.\nLearn more: ${USE_CACHE_PRIVATE_API_DOCS}`);
}
function createConnectionInUnstableCacheError(route) {
    return new Error(`Route "${route}": \`connection()\` can't be called inside \`unstable_cache()\` because cached functions may run during prerendering, without an incoming request. Call it outside the cached function.\nLearn more: ${UNSTABLE_CACHE_API_DOCS}`);
}
function createRouteHandlerRequestInUseCacheError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be read inside \`"use cache"\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createRouteHandlerRequestInUnstableCacheError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be read inside \`unstable_cache()\`. Read it outside the cached function and pass what you need as an argument.\nLearn more: ${UNSTABLE_CACHE_API_DOCS}`);
}
function createDraftModeMutationInUseCacheError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be called inside \`"use cache"\`. Draft mode can be read inside a cached function, but enabling or disabling it must happen outside.\nLearn more: ${NEXT_REQUEST_IN_USE_CACHE}`);
}
function createDraftModeMutationInUnstableCacheError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be called inside \`unstable_cache()\`. Draft mode can be read inside a cached function, but enabling or disabling it must happen outside.\nLearn more: ${UNSTABLE_CACHE_API_DOCS}`);
}
function createRevalidateDuringRenderError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be called during render. Call it from a Server Action or Route Handler instead.\nLearn more: ${REVALIDATE_IN_USE_CACHE}`);
}
function createRevalidateInCachedFunctionError(route, expression) {
    return new Error(`Route "${route}": \`${expression}\` can't be called inside a cached function. Call it from a Server Action or Route Handler instead.\nLearn more: ${REVALIDATE_IN_USE_CACHE}`);
}
function createRevalidateInBuildTimeGeneratorError(route, expression, generatorName) {
    return new Error(`Route "${route}": \`${expression}\` can't be called inside \`${generatorName}\`. Call it from a Server Action or Route Handler instead.\nLearn more: ${REVALIDATE_IN_USE_CACHE}`);
}
// Cache configuration and nesting
function routePrefix(route) {
    return route === undefined ? '' : `Route "${route}": `;
}
function createCacheTagOutsideUseCacheError(route) {
    return new Error(`${routePrefix(route)}\`cacheTag()\` can only be called inside a \`"use cache"\` or \`"use cache: private"\` function.\nLearn more: ${CACHE_TAG_OUTSIDE_USE_CACHE}`);
}
function createCacheLifeOutsideUseCacheError(route) {
    return new Error(`${routePrefix(route)}\`cacheLife()\` can only be called inside a \`"use cache"\` or \`"use cache: private"\` function.\nLearn more: ${CACHE_LIFE_OUTSIDE_USE_CACHE}`);
}
function createNestedCacheZeroRevalidateError(route, cause) {
    return new Error(`Route "${route}": A nested \`"use cache"\` with \`revalidate: 0\` is inside an outer \`"use cache"\` that has no \`cacheLife()\`. Add \`cacheLife()\` to the outer one to choose whether to prerender it with a non-zero \`revalidate\` or keep it dynamic with \`revalidate: 0\`.\nLearn more: ${NESTED_USE_CACHE_NO_EXPLICIT_CACHELIFE}`, {
        cause
    });
}
function createNestedCacheShortExpireError(route, cause) {
    return new Error(`Route "${route}": A nested \`"use cache"\` with a short \`expire\` (under 5 minutes) is inside an outer \`"use cache"\` that has no \`cacheLife()\`. Add \`cacheLife()\` to the outer one to choose whether to prerender it with a longer \`expire\` or keep it dynamic with a short \`expire\`.\nLearn more: ${NESTED_USE_CACHE_NO_EXPLICIT_CACHELIFE}`, {
        cause
    });
}
function createUseCachePrivateInsidePublicUseCacheError(route) {
    return new Error(`Route "${route}": \`"use cache: private"\` can't be nested inside \`"use cache"\` because a shared cached function can't depend on private request data. Nest it only inside another \`"use cache: private"\`.\nLearn more: ${USE_CACHE_PRIVATE_COMPOSITION}`);
}
function createUseCachePrivateInsideUnstableCacheError(route) {
    return new Error(`Route "${route}": \`"use cache: private"\` can't be used inside \`unstable_cache()\` because \`unstable_cache()\` uses a shared cache that can't contain private request data. Call the private cached function outside \`unstable_cache()\`.\nLearn more: ${USE_CACHE_PRIVATE_COMPOSITION}`);
}
function createUseCachePrivateOutsideRequestContextError(route, functionName) {
    return new Error(`Route "${route}": \`"use cache: private"\` needs an active request, so it can't be used during \`${functionName}\` or other build-time contexts. Move it to a request-time component or function.\nLearn more: ${USE_CACHE_PRIVATE_COMPOSITION}`);
}

//# sourceMappingURL=use-cache-messages.js.map