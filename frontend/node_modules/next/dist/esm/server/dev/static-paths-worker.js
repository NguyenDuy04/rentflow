import '../require-hook';
import '../node-environment';
import { collectSegments } from '../../build/segment-config/app/app-segments';
import { loadComponents } from '../load-components';
import { setHttpClientAndAgentOptions } from '../setup-http-agent-env';
import { isAppPageRouteModule } from '../route-modules/checks';
import { InvariantError } from '../../shared/lib/invariant-error';
import { collectRootParamKeys } from '../../build/segment-config/app/collect-root-param-keys';
import { buildAppStaticPaths } from '../../build/static-paths/app';
import { buildPagesStaticPaths } from '../../build/static-paths/pages';
import { createIncrementalCache } from '../../export/helpers/create-incremental-cache';
import { parseNormalizedAppRoute } from '../../shared/lib/router/routes/app';
// we call getStaticPaths in a separate process to ensure
// side-effects aren't relied on in dev that will break
// during a production build
export async function loadStaticPaths({ dir, distDir, pathname, config, httpAgentOptions, locales, defaultLocale, isAppPath, page, isrFlushToDisk, fetchCacheKeyPrefix, cacheMaxMemorySize, requestHeaders, cacheHandler, cacheHandlers, cacheLifeProfiles, nextConfigOutput, buildId, deploymentId, authInterrupts, useCacheTimeout, durableUseCacheEntries, staticPageGenerationTimeout, sriEnabled }) {
    // this needs to be initialized before loadComponents otherwise
    // "use cache" could be missing it's cache handlers
    await createIncrementalCache({
        dir,
        distDir,
        cacheHandler,
        cacheHandlers,
        requestHeaders,
        fetchCacheKeyPrefix,
        flushToDisk: isrFlushToDisk,
        cacheMaxMemorySize
    });
    // update work memory runtime-config
    setHttpClientAndAgentOptions({
        httpAgentOptions
    });
    const components = await loadComponents({
        distDir,
        // In `pages/`, the page is the same as the pathname.
        page: page || pathname,
        isAppPath,
        isDev: true,
        sriEnabled,
        needsManifestsForLegacyReasons: true
    });
    if (isAppPath) {
        const routeModule = components.routeModule;
        const { segments, segmentTree } = await collectSegments(// We know this is an app page or app route module because we checked
        // above that the page type is 'app'.
        routeModule, {
            cacheComponents: config.cacheComponents,
            partialPrefetching: config.partialPrefetching
        });
        const route = parseNormalizedAppRoute(pathname);
        if (route.dynamicSegments.length === 0) {
            throw new InvariantError(`Expected a dynamic route, but got a static route: ${pathname}`);
        }
        const isRoutePPREnabled = isAppPageRouteModule(routeModule) && config.cacheComponents;
        const isEnsureStaticPage = config.cacheComponents && isRoutePPREnabled && segments.some((segment)=>{
            var _segment_config;
            return ((_segment_config = segment.config) == null ? void 0 : _segment_config.ensureStatic) === 'navigation';
        });
        const rootParamKeys = collectRootParamKeys(routeModule);
        return buildAppStaticPaths({
            dir,
            page: pathname,
            route,
            cacheComponents: config.cacheComponents,
            segments,
            segmentTree,
            distDir,
            requestHeaders,
            cacheHandler,
            cacheLifeProfiles,
            isrFlushToDisk,
            fetchCacheKeyPrefix,
            cacheMaxMemorySize,
            ComponentMod: components.ComponentMod,
            nextConfigOutput,
            isRoutePPREnabled,
            isEnsureStaticPage,
            buildId,
            deploymentId,
            authInterrupts,
            useCacheTimeout,
            durableUseCacheEntries,
            staticPageGenerationTimeout,
            rootParamKeys
        });
    } else if (!components.getStaticPaths) {
        // We shouldn't get to this point since the worker should only be called for
        // SSG pages with getStaticPaths.
        throw new InvariantError(`Failed to load page with getStaticPaths for ${pathname}`);
    }
    return buildPagesStaticPaths({
        page: pathname,
        getStaticPaths: components.getStaticPaths,
        configFileName: config.configFileName,
        locales,
        defaultLocale
    });
}

//# sourceMappingURL=static-paths-worker.js.map