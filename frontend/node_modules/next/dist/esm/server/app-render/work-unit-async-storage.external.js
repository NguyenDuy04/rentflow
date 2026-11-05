// Share the instance module in the next-shared layer
import { workUnitAsyncStorageInstance } from './work-unit-async-storage-instance' with {
    'turbopack-transition': 'next-shared'
};
import { InvariantError } from '../../shared/lib/invariant-error';
export function willConsumerServerCache(workUnitStore) {
    if (!workUnitStore) {
        return false;
    }
    switch(workUnitStore.type){
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
            return workUnitStore.consumerWillServerCache;
        case 'prerender':
        case 'prerender-client':
        case 'prerender-legacy':
            return true;
        case 'request':
        case 'prerender-runtime':
        case 'validation-client':
        case 'build-time-generator':
            return false;
        default:
            return workUnitStore;
    }
}
export { workUnitAsyncStorageInstance as workUnitAsyncStorage };
export function throwForMissingRequestStore(callingExpression) {
    throw new Error(`\`${callingExpression}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`);
}
export function throwInvariantForMissingStore() {
    throw new InvariantError('Expected workUnitAsyncStorage to have a store.');
}
/**
 * Returns the resume data cache for the given work unit store, regardless of
 * whether it is mutable (`PrerenderResumeDataCache`) or read-only
 * (`RenderResumeDataCache`). Use `resumeDataCache.mutable` to narrow.
 */ export function getResumeDataCache(workUnitStore) {
    switch(workUnitStore.type){
        case 'request':
        case 'prerender':
        case 'prerender-runtime':
        case 'prerender-client':
        case 'validation-client':
            return workUnitStore.resumeDataCache;
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
        case 'prerender-legacy':
        case 'build-time-generator':
            return null;
        default:
            return workUnitStore;
    }
}
export function getHmrRefreshHash(workUnitStore) {
    if (process.env.__NEXT_DEV_SERVER) {
        switch(workUnitStore.type){
            case 'cache':
            case 'private-cache':
            case 'prerender':
            case 'prerender-runtime':
            case 'request':
                return workUnitStore.hmrRefreshHash;
            case 'prerender-client':
            case 'validation-client':
            case 'prerender-legacy':
            case 'unstable-cache':
            case 'build-time-generator':
                break;
            default:
                workUnitStore;
        }
    }
    return undefined;
}
export function isHmrRefresh(workUnitStore) {
    if (process.env.__NEXT_DEV_SERVER) {
        switch(workUnitStore.type){
            case 'cache':
            case 'private-cache':
            case 'request':
                return workUnitStore.isHmrRefresh ?? false;
            case 'prerender':
            case 'prerender-client':
            case 'validation-client':
            case 'prerender-runtime':
            case 'prerender-legacy':
            case 'unstable-cache':
            case 'build-time-generator':
                break;
            default:
                workUnitStore;
        }
    }
    return false;
}
export function getServerComponentsHmrCache(workUnitStore) {
    if (process.env.__NEXT_DEV_SERVER) {
        switch(workUnitStore.type){
            case 'cache':
            case 'private-cache':
            case 'request':
                return workUnitStore.serverComponentsHmrCache;
            case 'prerender':
            case 'prerender-client':
            case 'validation-client':
            case 'prerender-runtime':
            case 'prerender-legacy':
            case 'unstable-cache':
            case 'build-time-generator':
                break;
            default:
                workUnitStore;
        }
    }
    return undefined;
}
/**
 * Returns a draft mode provider only if draft mode is enabled.
 */ export function getDraftModeProviderForCacheScope(workStore, workUnitStore) {
    if (workStore.isDraftMode) {
        switch(workUnitStore.type){
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
            case 'prerender-runtime':
            case 'request':
                return workUnitStore.draftMode;
            case 'prerender':
            case 'prerender-client':
            case 'validation-client':
            case 'prerender-legacy':
            case 'build-time-generator':
                break;
            default:
                workUnitStore;
        }
    }
    return undefined;
}
export function getStagedRenderingController(workUnitStore) {
    switch(workUnitStore.type){
        case 'request':
        case 'prerender-runtime':
        case 'prerender':
            return workUnitStore.stagedRendering ?? null;
        case 'prerender-client':
        case 'validation-client':
        case 'prerender-legacy':
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
        case 'build-time-generator':
            return null;
        default:
            return workUnitStore;
    }
}
export function getCacheSignal(workUnitStore) {
    switch(workUnitStore.type){
        case 'prerender':
        case 'prerender-client':
        case 'validation-client':
        case 'prerender-runtime':
            return workUnitStore.cacheSignal;
        case 'request':
            {
                // In dev, we might fill caches even during a dynamic request.
                if (workUnitStore.cacheSignal) {
                    return workUnitStore.cacheSignal;
                }
            // fallthrough
            }
        case 'prerender-legacy':
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
        case 'build-time-generator':
            return null;
        default:
            return workUnitStore;
    }
}
export function getVaryParamsAccumulator(workUnitStore) {
    switch(workUnitStore.type){
        case 'prerender':
        case 'prerender-runtime':
        case 'request':
            {
                return workUnitStore.varyParamsAccumulator ?? null;
            }
        case 'prerender-legacy':
        case 'cache':
        case 'private-cache':
        case 'prerender-client':
        case 'validation-client':
        case 'unstable-cache':
        case 'build-time-generator':
            return null;
        default:
            workUnitStore;
            return null;
    }
}

//# sourceMappingURL=work-unit-async-storage.external.js.map