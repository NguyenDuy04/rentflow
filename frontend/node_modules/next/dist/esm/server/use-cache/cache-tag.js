import { workAsyncStorage } from '../app-render/work-async-storage.external';
import { workUnitAsyncStorage } from '../app-render/work-unit-async-storage.external';
import { validateTags } from '../lib/patch-fetch';
import { createCacheTagOutsideUseCacheError } from './use-cache-messages';
export function cacheTag(...tags) {
    if (!process.env.__NEXT_USE_CACHE) {
        throw new Error('`cacheTag()` is only available with the `cacheComponents` config.');
    }
    const workUnitStore = workUnitAsyncStorage.getStore();
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
            throw createCacheTagOutsideUseCacheError((_workAsyncStorage_getStore = workAsyncStorage.getStore()) == null ? void 0 : _workAsyncStorage_getStore.route);
        case 'cache':
        case 'private-cache':
            break;
        default:
            workUnitStore;
    }
    const validTags = validateTags(tags, '`cacheTag()`');
    if (!workUnitStore.tags) {
        workUnitStore.tags = validTags;
    } else {
        workUnitStore.tags.push(...validTags);
    }
}

//# sourceMappingURL=cache-tag.js.map