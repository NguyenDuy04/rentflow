const CachedSearchParams = new WeakMap();
function makeUntrackedSearchParams(underlyingSearchParams) {
    const cachedSearchParams = CachedSearchParams.get(underlyingSearchParams);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const promise = Promise.resolve(underlyingSearchParams);
    promise.status = 'fulfilled';
    promise.value = underlyingSearchParams;
    CachedSearchParams.set(underlyingSearchParams, promise);
    return promise;
}
export function createRenderSearchParamsFromClient(underlyingSearchParams) {
    return makeUntrackedSearchParams(underlyingSearchParams);
}

//# sourceMappingURL=search-params.browser.prod.js.map