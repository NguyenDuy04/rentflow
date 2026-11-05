import path from 'path';
import { IncrementalCache } from '../../server/lib/incremental-cache';
import { hasNextSupport } from '../../server/ci-info';
import { nodeFs } from '../../server/lib/node-fs-methods';
import { interopDefault } from '../../lib/interop-default';
import { formatDynamicImportPath } from '../../lib/format-dynamic-import-path';
import { initializeCacheHandlers, registerCustomCacheHandlers, setCacheHandler } from '../../server/use-cache/handlers';
export async function createIncrementalCache({ cacheHandler, cacheMaxMemorySize, fetchCacheKeyPrefix, distDir, dir, flushToDisk, cacheHandlers, requestHeaders }) {
    // Custom cache handler overrides.
    let CacheHandler;
    if (cacheHandler) {
        CacheHandler = interopDefault(await import(formatDynamicImportPath(dir, cacheHandler)).then((mod)=>mod.default || mod));
    }
    if (cacheHandlers) {
        initializeCacheHandlers(cacheMaxMemorySize);
        await registerCustomCacheHandlers(async ()=>{
            for (const [kind, handler] of Object.entries(cacheHandlers)){
                if (!handler) continue;
                setCacheHandler(kind, interopDefault(await import(formatDynamicImportPath(dir, handler)).then((mod)=>mod.default || mod)));
            }
        });
    }
    let previewProps = {
        previewModeEncryptionKey: '',
        previewModeId: '',
        previewModeSigningKey: ''
    };
    const incrementalCache = new IncrementalCache({
        dev: false,
        requestHeaders: requestHeaders || {},
        flushToDisk,
        maxMemoryCacheSize: cacheMaxMemorySize,
        fetchCacheKeyPrefix,
        previewProps,
        prerenderManifest: {
            version: 4,
            routes: {},
            dynamicRoutes: {},
            notFoundRoutes: [],
            preview: previewProps
        },
        fs: nodeFs,
        serverDistDir: path.join(distDir, 'server'),
        CurCacheHandler: CacheHandler,
        minimalMode: hasNextSupport
    });
    globalThis.__incrementalCache = incrementalCache;
    return incrementalCache;
}

//# sourceMappingURL=create-incremental-cache.js.map