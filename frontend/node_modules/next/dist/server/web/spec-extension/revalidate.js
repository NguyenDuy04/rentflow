"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    refresh: null,
    revalidatePath: null,
    revalidateTag: null,
    updateTag: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    refresh: function() {
        return refresh;
    },
    revalidatePath: function() {
        return revalidatePath;
    },
    revalidateTag: function() {
        return revalidateTag;
    },
    updateTag: function() {
        return updateTag;
    }
});
const _dynamicrendering = require("../../app-render/dynamic-rendering");
const _utils = require("../../../shared/lib/router/utils");
const _constants = require("../../../lib/constants");
const _workasyncstorageexternal = require("../../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../../app-render/work-unit-async-storage.external");
const _hooksservercontext = require("../../../client/components/hooks-server-context");
const _invarianterror = require("../../../shared/lib/invariant-error");
const _actionrevalidationkind = require("../../../shared/lib/action-revalidation-kind");
const _removetrailingslash = require("../../../shared/lib/router/utils/remove-trailing-slash");
const _encodeheadersafe = require("../../lib/encode-header-safe");
const _usecachemessages = require("../../use-cache/use-cache-messages");
const _cachelifeprofile = require("../../use-cache/cache-life-profile");
function revalidateTag(tag, profile) {
    if (!profile) {
        console.warn('"revalidateTag" without the second argument is now deprecated, add second argument of "max" or use "updateTag". See more info here: https://nextjs.org/docs/messages/revalidate-tag-single-arg');
    } else if (typeof profile === 'object') {
        profile = (0, _cachelifeprofile.validateAndNormalizeCacheLifeProfile)(profile, {
            kind: 'inline'
        });
    }
    return revalidate([
        (0, _encodeheadersafe.encodeHeaderSafe)(tag)
    ], `revalidateTag(${JSON.stringify(tag)})`, profile);
}
function updateTag(tag) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    // TODO: change this after investigating why phase: 'action' is
    // set for route handlers
    if (!workStore || workStore.page.endsWith('/route')) {
        throw new Error('updateTag can only be called from within a Server Action. ' + 'To invalidate cache tags in Route Handlers or other contexts, use revalidateTag instead. ' + 'See more info here: https://nextjs.org/docs/app/api-reference/functions/updateTag');
    }
    // updateTag uses immediate expiration (no profile) without deprecation warning
    return revalidate([
        (0, _encodeheadersafe.encodeHeaderSafe)(tag)
    ], `updateTag(${JSON.stringify(tag)})`, undefined);
}
function refresh() {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workStore || workStore.page.endsWith('/route') || (workUnitStore == null ? void 0 : workUnitStore.phase) !== 'action') {
        throw new Error('refresh can only be called from within a Server Action. ' + 'See more info here: https://nextjs.org/docs/app/api-reference/functions/refresh');
    }
    if (workStore) {
        // The Server Action version of refresh() only revalidates the dynamic data
        // on the client. It doesn't affect cached data.
        workStore.pathWasRevalidated = _actionrevalidationkind.ActionDidRevalidateDynamicOnly;
    }
}
function revalidatePath(originalPath, type) {
    if (originalPath.length > _constants.NEXT_CACHE_SOFT_TAG_MAX_LENGTH) {
        console.warn(`Warning: revalidatePath received "${originalPath}" which exceeded max length of ${_constants.NEXT_CACHE_SOFT_TAG_MAX_LENGTH}. See more info here https://nextjs.org/docs/app/api-reference/functions/revalidatePath`);
        return;
    }
    let normalizedPath = `${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}${(0, _encodeheadersafe.encodeHeaderSafe)((0, _removetrailingslash.removeTrailingSlash)(originalPath))}`;
    if (type) {
        normalizedPath += `${normalizedPath.endsWith('/') ? '' : '/'}${type}`;
    } else if ((0, _utils.isDynamicRoute)(originalPath)) {
        console.warn(`Warning: a dynamic page path "${originalPath}" was passed to "revalidatePath", but the "type" parameter is missing. This has no effect by default, see more info here https://nextjs.org/docs/app/api-reference/functions/revalidatePath`);
    }
    const tags = [
        normalizedPath
    ];
    if (normalizedPath === `${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}/`) {
        tags.push(`${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}/index`);
    } else if (normalizedPath === `${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}/index`) {
        tags.push(`${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}/`);
    }
    return revalidate(tags, `revalidatePath(${JSON.stringify(originalPath)})`);
}
function revalidate(tags, expression, profile) {
    const store = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!store || !store.incrementalCache) {
        throw new Error(`Invariant: static generation store missing in ${expression}`);
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        // Prefer the more specific contexts over the general render-phase error.
        switch(workUnitStore.type){
            case 'build-time-generator':
                throw (0, _usecachemessages.createRevalidateInBuildTimeGeneratorError)(store.route, expression, workUnitStore.functionName);
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                throw (0, _usecachemessages.createRevalidateInCachedFunctionError)(store.route, expression);
            case 'prerender':
            case 'prerender-runtime':
            case 'prerender-client':
            case 'validation-client':
            case 'prerender-legacy':
            case 'request':
                break;
            default:
                workUnitStore;
        }
        if (workUnitStore.phase === 'render') {
            throw (0, _usecachemessages.createRevalidateDuringRenderError)(store.route, expression);
        }
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-runtime':
                // cacheComponents Prerender
                const error = new Error(`Route ${store.route} used ${expression} without first calling \`await connection()\`.`);
                return (0, _dynamicrendering.abortAndThrowOnSynchronousRequestDataAccess)(store.route, expression, error, workUnitStore);
            case 'prerender-client':
            case 'validation-client':
                throw new _invarianterror.InvariantError(`${expression} must not be used within a client component. Next.js should be preventing ${expression} from being included in client components statically, but did not in this case.`);
            case 'prerender-legacy':
                workUnitStore.revalidate = 0;
                const err = new _hooksservercontext.DynamicServerError(`Route ${store.route} couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`);
                store.dynamicUsageDescription = expression;
                store.dynamicUsageStack = err.stack;
                throw err;
            case 'request':
                break;
            default:
                workUnitStore;
        }
    }
    if (!store.pendingRevalidatedTags) {
        store.pendingRevalidatedTags = [];
    }
    const revalidatedAt = performance.timeOrigin + performance.now();
    for (const tag of tags){
        const existingIndex = store.pendingRevalidatedTags.findIndex((item)=>{
            if (item.tag !== tag) return false;
            // Compare profiles: both strings, both objects, or both undefined
            if (typeof item.profile === 'string' && typeof profile === 'string') {
                return item.profile === profile;
            }
            if (typeof item.profile === 'object' && typeof profile === 'object') {
                return JSON.stringify(item.profile) === JSON.stringify(profile);
            }
            return item.profile === profile;
        });
        if (existingIndex === -1) {
            store.pendingRevalidatedTags.push({
                tag,
                profile,
                revalidatedAt
            });
        } else {
            // Revalidating a tag again invalidates everything produced up to now, so
            // the latest revalidation is the one that decides which entries are
            // stale.
            store.pendingRevalidatedTags[existingIndex].revalidatedAt = revalidatedAt;
        }
    }
    // if profile is provided and this is a stale-while-revalidate
    // update we do not mark the path as revalidated so that server
    // actions don't pull their own writes
    const cacheLife = profile && typeof profile === 'object' ? profile : profile && typeof profile === 'string' && (store == null ? void 0 : store.cacheLifeProfiles[profile]) ? store.cacheLifeProfiles[profile] : undefined;
    if (!profile || (cacheLife == null ? void 0 : cacheLife.expire) === 0) {
        // TODO: only revalidate if the path matches
        store.pathWasRevalidated = _actionrevalidationkind.ActionDidRevalidateStaticAndDynamic;
    }
}

//# sourceMappingURL=revalidate.js.map