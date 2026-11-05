import { AfterContext } from '../after/after-context';
import { normalizeAppPath } from '../../shared/lib/router/utils/app-paths';
import { createLazyResult } from '../lib/lazy-result';
import { getCacheHandlerEntries } from '../use-cache/handlers';
import { createSnapshot } from '../app-render/async-local-storage';
export function createWorkStore(context) {
    return createWorkStoreImpl(context, !!process.env.__NEXT_DEV_SERVER);
}
export function createPrerenderWorkStore(context) {
    return createWorkStoreImpl(context, !!process.env.__NEXT_DEV_SERVER || !!process.env.NEXT_DEBUG_BUILD || process.env.NEXT_SSG_FETCH_METRICS === '1');
}
function createWorkStoreImpl({ page, renderOpts, isPrefetchRequest, buildId, deploymentId, previouslyRevalidatedTags, nonce }, shouldTrackFetchMetrics) {
    const store = {
        page,
        route: normalizeAppPath(page),
        incrementalCache: // we fallback to a global incremental cache for edge-runtime locally
        // so that it can access the fs cache without mocks
        renderOpts.incrementalCache || globalThis.__incrementalCache,
        cacheLifeProfiles: renderOpts.cacheLifeProfiles,
        useCacheTimeout: renderOpts.experimental.useCacheTimeout,
        durableUseCacheEntries: renderOpts.experimental.durableUseCacheEntries,
        staticPageGenerationTimeout: renderOpts.staticPageGenerationTimeout,
        isBuildTimePrerendering: renderOpts.isBuildTimePrerendering,
        fetchCache: renderOpts.fetchCache,
        isOnDemandRevalidate: renderOpts.isOnDemandRevalidate,
        requestId: undefined,
        htmlRequestId: undefined,
        isDraftMode: renderOpts.isDraftMode,
        isPrefetchRequest,
        buildId,
        deploymentId,
        reactLoadableManifest: (renderOpts == null ? void 0 : renderOpts.reactLoadableManifest) || {},
        assetPrefix: (renderOpts == null ? void 0 : renderOpts.assetPrefix) || '',
        nonce,
        afterContext: createAfterContext(renderOpts),
        cacheComponentsEnabled: renderOpts.cacheComponents,
        validationLevel: renderOpts.validationLevel,
        previouslyRevalidatedTags,
        requestStartTime: performance.timeOrigin + performance.now(),
        refreshTagsByCacheKind: createRefreshTagsByCacheKind(),
        runInCleanSnapshot: createSnapshot(),
        shouldTrackFetchMetrics,
        clientComponentLoadTracker: undefined,
        reactServerErrorsByDigest: new Map()
    };
    // TODO: remove this when we resolve accessing the store outside the execution context
    renderOpts.store = store;
    return store;
}
function createAfterContext(renderOpts) {
    const { waitUntil, onClose, onAfterTaskError } = renderOpts;
    return new AfterContext({
        waitUntil,
        onClose,
        onTaskError: onAfterTaskError
    });
}
/**
 * Creates a map with lazy results that refresh tags for the respective cache
 * kind when they're awaited for the first time.
 */ function createRefreshTagsByCacheKind() {
    const refreshTagsByCacheKind = new Map();
    const cacheHandlers = getCacheHandlerEntries();
    if (cacheHandlers) {
        for (const [kind, cacheHandler] of cacheHandlers){
            if ('refreshTags' in cacheHandler) {
                refreshTagsByCacheKind.set(kind, createLazyResult(async ()=>cacheHandler.refreshTags()));
            }
        }
    }
    return refreshTagsByCacheKind;
}

//# sourceMappingURL=work-store.js.map