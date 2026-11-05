"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "handleBuildComplete", {
    enumerable: true,
    get: function() {
        return handleBuildComplete;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _crypto = /*#__PURE__*/ _interop_require_default(require("crypto"));
const _promises = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
const _url = require("url");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../output/log"));
const _utils = require("../utils");
const _renderingmode = require("../rendering-mode");
const _interopdefault = require("../../lib/interop-default");
const _recursivereaddir = require("../../lib/recursive-readdir");
const _utils1 = require("../../shared/lib/router/utils");
const _apppaths = require("../../shared/lib/router/utils/app-paths");
const _constants = require("../../shared/lib/constants");
const _normalizepagepath = require("../../shared/lib/page-path/normalize-page-path");
const _normalizepathsep = require("../../shared/lib/page-path/normalize-path-sep");
const _routingutils = require("next/dist/compiled/@vercel/routing-utils");
const _constants1 = require("../../lib/constants");
const _normalizelocalepath = require("../../shared/lib/i18n/normalize-locale-path");
const _getmetadataroute = require("../../lib/metadata/get-metadata-route");
const _ismetadataroute = require("../../lib/metadata/is-metadata-route");
const _addpathprefix = require("../../shared/lib/router/utils/add-path-prefix");
const _redirectstatus = require("../../lib/redirect-status");
const _routeregex = require("../../shared/lib/router/utils/route-regex");
const _escaperegexp = require("../../shared/lib/escape-regexp");
const _sortableroutes = require("../../shared/lib/router/utils/sortable-routes");
const _requirehook = require("../../server/require-hook");
const _generateroutesmanifest = require("../generate-routes-manifest");
const _fallbackshellruns = require("./fallback-shell-runs");
const _bundler = require("../../lib/bundler");
const _formatdynamicimportpath = require("../../lib/format-dynamic-import-path");
const _invarianterror = require("../../shared/lib/invariant-error");
const _nft = require("../nft");
const _syntheticsymlinks = require("./synthetic-symlinks");
const _routecachekey = require("../../server/lib/route-cache-key");
const _routekind = require("../../server/route-kind");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
// App paths sharing a pathname collapse into one Adapter output. Put the
// canonical entry first because later paths only merge assets into that output.
function orderAppPageKeysByEntry(appPageKeys) {
    const appPathsByPathname = new Map();
    for (const page of appPageKeys){
        const pathname = (0, _apppaths.normalizeAppPath)(page);
        const appPaths = appPathsByPathname.get(pathname);
        if (appPaths) {
            appPaths.push(page);
        } else {
            appPathsByPathname.set(pathname, [
                page
            ]);
        }
    }
    const orderedAppPageKeys = [];
    for (const [pathname, appPaths] of appPathsByPathname){
        const entryPage = (0, _apppaths.selectAppPageEntry)(pathname, appPaths);
        orderedAppPageKeys.push(entryPage);
        for (const appPath of appPaths){
            if (appPath !== entryPage) {
                orderedAppPageKeys.push(appPath);
            }
        }
    }
    return orderedAppPageKeys;
}
function getPrerenderClassification(route, routeType, response, compute, htmlSize) {
    if (routeType === undefined && response === undefined && compute === undefined && htmlSize === undefined) {
        return {};
    }
    if (routeType === undefined || response === undefined || compute === undefined) {
        throw new _invarianterror.InvariantError(`Expected complete prerender classification for route "${route}"`);
    }
    return {
        routeType,
        response,
        compute,
        ...typeof htmlSize === 'number' && {
            htmlSize
        }
    };
}
function normalizePathnames(config, outputs) {
    // normalize pathname field with basePath
    if (config.basePath) {
        for (const output of [
            ...outputs.pages,
            ...outputs.pagesApi,
            ...outputs.appPages,
            ...outputs.appRoutes,
            ...outputs.prerenders,
            ...outputs.staticFiles
        ]){
            output.pathname = (0, _addpathprefix.addPathPrefix)(output.pathname, config.basePath).replace(/\/$/, '') || '/';
        }
    }
}
async function handleBuildComplete({ dir, config, appType, buildId, configOutDir, distDir, pageKeys, bundler, repoRoot, outputFileTracingRoot, adapterPath, appPageKeys, staticPages, nextVersion, hasStatic404, hasStatic500, previewProps, routesManifest, serverPropsPages, hasNodeMiddleware, prerenderManifest, middlewareManifest, requiredServerFiles, hasInstrumentationHook, functionsConfigManifest }) {
    const adapterMod = (0, _interopdefault.interopDefault)(await import((0, _url.pathToFileURL)(require.resolve(adapterPath)).href));
    if (typeof adapterMod.onBuildComplete === 'function') {
        const syntheticSymlinks = (0, _syntheticsymlinks.createAdapterSyntheticSymlinkDirectory)(distDir);
        const outputs = {
            pages: [],
            pagesApi: [],
            appPages: [],
            appRoutes: [],
            prerenders: [],
            staticFiles: []
        };
        const clientHashes = bundler === _bundler.Bundler.Turbopack && config.supportsImmutableAssets ? JSON.parse(await _promises.default.readFile(_path.default.join(distDir, 'immutable-static-hashes.json'), 'utf8')) : undefined;
        if (config.output === 'export') {
            // collect export assets and provide as static files
            const exportFiles = await (0, _recursivereaddir.recursiveReadDir)(configOutDir);
            for (const file of exportFiles){
                let pathname = (file.endsWith('.html') ? file.replace(/\.html$/, '') : file).replace(/\\/g, '/');
                pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
                const immutableId = (0, _normalizepathsep.normalizePathSep)(file).replace(/^\/?_next\//, '');
                outputs.staticFiles.push({
                    id: file,
                    pathname,
                    filePath: _path.default.join(configOutDir, file),
                    type: _constants.AdapterOutputType.STATIC_FILE,
                    immutableHash: clientHashes == null ? void 0 : clientHashes[immutableId]
                });
            }
        } else {
            const staticFiles = await (0, _recursivereaddir.recursiveReadDir)(_path.default.join(distDir, 'static'));
            for (const file of staticFiles){
                const pathname = _path.default.posix.join('/_next/static', file);
                const filePath = _path.default.join(distDir, 'static', file);
                const id = _path.default.join('static', file);
                outputs.staticFiles.push({
                    type: _constants.AdapterOutputType.STATIC_FILE,
                    id,
                    pathname,
                    filePath,
                    immutableHash: clientHashes == null ? void 0 : clientHashes[id]
                });
            }
            const { sharedNodeAssets, sharedNodeAssetsHashes, pagesSharedNodeAssets, pagesSharedNodeAssetsHashes, appPagesSharedNodeAssets, appPagesSharedNodeAssetsHashes } = await getSharedNodeAssets({
                distDir,
                requiredServerFiles,
                dir,
                repoRoot,
                outputFileTracingRoot,
                bundler,
                hasInstrumentationHook,
                config,
                syntheticSymlinks
            });
            async function handleTraceFiles(entryFilePath, type) {
                const assets = {};
                const assetsHashes = {};
                const { entryHash } = await loadNFT(assets, assetsHashes, repoRoot, `${entryFilePath}.nft.json`, syntheticSymlinks, config.outputHashSalt || '');
                Object.assign(assets, sharedNodeAssets, type === 'pages' ? pagesSharedNodeAssets : {}, type === 'app' ? appPagesSharedNodeAssets : {});
                Object.assign(assetsHashes, sharedNodeAssetsHashes, type === 'pages' ? pagesSharedNodeAssetsHashes : {}, type === 'app' ? appPagesSharedNodeAssetsHashes : {});
                if (entryHash) {
                    assetsHashes[_path.default.relative(repoRoot, entryFilePath)] = entryHash;
                }
                return {
                    assets,
                    assetsHashes,
                    entryHash
                };
            }
            async function handleEdgeFunction(page, isMiddleware = false) {
                let type = _constants.AdapterOutputType.PAGES;
                const isAppPrefix = page.name.startsWith('app/');
                const isAppPage = isAppPrefix && page.name.endsWith('/page');
                const isAppRoute = isAppPrefix && page.name.endsWith('/route');
                let currentOutputs = outputs.pages;
                if (isMiddleware) {
                    type = _constants.AdapterOutputType.MIDDLEWARE;
                } else if (isAppPage) {
                    currentOutputs = outputs.appPages;
                    type = _constants.AdapterOutputType.APP_PAGE;
                } else if (isAppRoute) {
                    currentOutputs = outputs.appRoutes;
                    type = _constants.AdapterOutputType.APP_ROUTE;
                } else if (page.page.startsWith('/api')) {
                    currentOutputs = outputs.pagesApi;
                    type = _constants.AdapterOutputType.PAGES_API;
                }
                const route = page.page.replace(/^(app|pages)\//, '');
                const pathname = isAppPrefix ? (0, _apppaths.normalizeAppPath)(route) : route === '/index' ? '/' : route.replace(/\/index$/, '');
                const functionConfig = functionsConfigManifest.functions[pathname] || {};
                const edgeEntrypointRelativePath = page.entrypoint;
                const edgeEntrypointPath = _path.default.join(distDir, edgeEntrypointRelativePath);
                const output = {
                    type,
                    id: page.name,
                    runtime: 'edge',
                    sourcePage: route,
                    pathname,
                    filePath: edgeEntrypointPath,
                    edgeRuntime: {
                        modulePath: edgeEntrypointPath,
                        entryKey: `middleware_${page.name}`,
                        handlerExport: 'handler'
                    },
                    assets: {},
                    assetsHashes: {},
                    // Computing assetsHash for edge functions isn't implemented for now
                    wasmAssets: {},
                    config: {
                        maxDuration: functionConfig.maxDuration,
                        env: page.env,
                        preferredRegion: page.regions
                    }
                };
                for (const file of page.files){
                    const originalPath = _path.default.join(distDir, file);
                    const fileOutputPath = _path.default.relative(config.distDir, _path.default.join(_path.default.relative(repoRoot, distDir), file));
                    output.assets[fileOutputPath] = originalPath;
                }
                for (const item of [
                    ...page.assets || []
                ]){
                    output.assets[item.name] = _path.default.join(distDir, item.filePath);
                }
                for (const item of page.wasm || []){
                    if (!output.wasmAssets) {
                        output.wasmAssets = {};
                    }
                    output.wasmAssets[item.name] = _path.default.join(distDir, item.filePath);
                }
                if (type === _constants.AdapterOutputType.MIDDLEWARE) {
                    ;
                    output.config.matchers = page.matchers.map((item)=>{
                        return {
                            source: item.originalSource,
                            sourceRegex: item.regexp,
                            has: item.has,
                            missing: [
                                ...item.missing || [],
                                // always skip middleware for on-demand revalidate
                                {
                                    type: 'header',
                                    key: 'x-prerender-revalidate',
                                    value: previewProps.previewModeId
                                }
                            ]
                        };
                    });
                    output.pathname = '/_middleware';
                    output.id = page.name;
                    outputs.middleware = output;
                } else {
                    currentOutputs.push(output);
                }
                // need to add matching .rsc output
                if (isAppPage) {
                    const rscPathname = (0, _normalizepagepath.normalizePagePath)(output.pathname) + '.rsc';
                    outputs.appPages.push({
                        ...output,
                        pathname: rscPathname,
                        id: page.name + '.rsc'
                    });
                } else if (type !== _constants.AdapterOutputType.MIDDLEWARE && serverPropsPages.has(pathname)) {
                    const nextDataPath = _path.default.posix.join('/_next/data/', buildId, (0, _normalizepagepath.normalizePagePath)(pathname) + '.json');
                    outputs.pages.push({
                        ...output,
                        pathname: nextDataPath
                    });
                }
            }
            const edgeFunctionHandlers = [];
            for (const middleware of Object.values(middlewareManifest.middleware)){
                if ((0, _utils.isMiddlewareFilename)(middleware.name)) {
                    edgeFunctionHandlers.push(handleEdgeFunction(middleware, true));
                }
            }
            for (const page of Object.values(middlewareManifest.functions)){
                edgeFunctionHandlers.push(handleEdgeFunction(page));
            }
            const pagesDistDir = _path.default.join(distDir, 'server', 'pages');
            const pageOutputMap = {};
            const rscFallbackPath = _path.default.join(distDir, 'server', 'rsc-fallback.json');
            const emittedStaticFilePathnames = new Set();
            if (appPageKeys && appPageKeys.length > 0 && pageKeys.length > 0) {
                await _promises.default.writeFile(rscFallbackPath, '{}');
            }
            for (const page of pageKeys){
                if (page === '/_app' || page === '/_document') {
                    continue;
                }
                if (middlewareManifest.functions.hasOwnProperty(page)) {
                    continue;
                }
                const route = (0, _normalizepagepath.normalizePagePath)(page);
                const pageFile = _path.default.join(pagesDistDir, `${route}.js`);
                // if it's an auto static optimized page it's just
                // a static file
                if (staticPages.has(page)) {
                    if (config.i18n) {
                        for (const locale of config.i18n.locales || []){
                            const localePage = page === '/' ? `/${locale}` : (0, _addpathprefix.addPathPrefix)(page, `/${locale}`);
                            const localeOutput = {
                                id: localePage,
                                pathname: localePage,
                                type: _constants.AdapterOutputType.STATIC_FILE,
                                filePath: _path.default.join(pagesDistDir, `${(0, _normalizepagepath.normalizePagePath)(localePage)}.html`),
                                immutableHash: undefined
                            };
                            outputs.staticFiles.push(localeOutput);
                            emittedStaticFilePathnames.add(localeOutput.pathname);
                            if (appPageKeys && appPageKeys.length > 0) {
                                outputs.staticFiles.push({
                                    id: `${localePage}.rsc`,
                                    pathname: `${localePage}.rsc`,
                                    type: _constants.AdapterOutputType.STATIC_FILE,
                                    filePath: rscFallbackPath,
                                    immutableHash: undefined
                                });
                            }
                        }
                    } else {
                        const staticOutput = {
                            id: page,
                            pathname: route,
                            type: _constants.AdapterOutputType.STATIC_FILE,
                            filePath: pageFile.replace(/\.js$/, '.html'),
                            immutableHash: undefined
                        };
                        outputs.staticFiles.push(staticOutput);
                        emittedStaticFilePathnames.add(staticOutput.pathname);
                        if (appPageKeys && appPageKeys.length > 0) {
                            outputs.staticFiles.push({
                                id: `${page}.rsc`,
                                pathname: `${route}.rsc`,
                                type: _constants.AdapterOutputType.STATIC_FILE,
                                filePath: rscFallbackPath,
                                immutableHash: undefined
                            });
                        }
                    }
                    if (page !== '/404') {
                        continue;
                    }
                }
                const { assets, assetsHashes } = await handleTraceFiles(pageFile, 'pages').catch((err)=>{
                    if (err.code !== 'ENOENT' || page !== '/404' && page !== '/500') {
                        _log.warn(`Failed to locate traced assets for ${pageFile}`, err);
                    }
                    return {
                        assets: {},
                        assetsHashes: {}
                    };
                });
                const functionConfig = functionsConfigManifest.functions[route] || {};
                let sourcePage = route.replace(/^\//, '');
                sourcePage = sourcePage === 'api' ? 'api/index' : sourcePage;
                const output = {
                    id: route,
                    type: page.startsWith('/api') ? _constants.AdapterOutputType.PAGES_API : _constants.AdapterOutputType.PAGES,
                    filePath: pageFile,
                    pathname: route,
                    sourcePage,
                    assets,
                    assetsHashes,
                    runtime: 'nodejs',
                    config: {
                        maxDuration: functionConfig.maxDuration,
                        preferredRegion: functionConfig.regions
                    }
                };
                pageOutputMap[page] = output;
                if (output.type === _constants.AdapterOutputType.PAGES) {
                    var _config_i18n;
                    outputs.pages.push(output);
                    // if page is get server side props we need to create
                    // the _next/data output as well
                    if (serverPropsPages.has(page)) {
                        const dataPathname = _path.default.posix.join('/_next/data', buildId, (0, _normalizepagepath.normalizePagePath)(page) + '.json');
                        outputs.pages.push({
                            ...output,
                            pathname: dataPathname,
                            id: dataPathname
                        });
                        if (appPageKeys && appPageKeys.length > 0) {
                            const rscPage = `${page === '/' ? '/index' : page}.rsc`;
                            outputs.staticFiles.push({
                                id: rscPage,
                                pathname: rscPage,
                                type: _constants.AdapterOutputType.STATIC_FILE,
                                filePath: rscFallbackPath,
                                immutableHash: undefined
                            });
                        }
                    }
                    for (const locale of ((_config_i18n = config.i18n) == null ? void 0 : _config_i18n.locales) || []){
                        const localePage = page === '/' ? `/${locale}` : (0, _addpathprefix.addPathPrefix)(page, `/${locale}`);
                        outputs.pages.push({
                            ...output,
                            id: localePage,
                            pathname: localePage
                        });
                        if (serverPropsPages.has(page)) {
                            const dataPathname = _path.default.posix.join('/_next/data', buildId, localePage + '.json');
                            outputs.pages.push({
                                ...output,
                                pathname: dataPathname,
                                id: dataPathname
                            });
                            if (appPageKeys && appPageKeys.length > 0) {
                                outputs.staticFiles.push({
                                    id: `${localePage}.rsc`,
                                    pathname: `${localePage}.rsc`,
                                    type: _constants.AdapterOutputType.STATIC_FILE,
                                    filePath: rscFallbackPath,
                                    immutableHash: undefined
                                });
                            }
                        }
                    }
                } else {
                    outputs.pagesApi.push(output);
                }
            }
            if (hasNodeMiddleware) {
                var _functionConfig_matchers;
                const middlewareFile = _path.default.join(distDir, 'server', 'middleware.js');
                const { assets, assetsHashes } = await handleTraceFiles(middlewareFile, 'neutral');
                const functionConfig = functionsConfigManifest.functions['/_middleware'] || {};
                outputs.middleware = {
                    pathname: '/_middleware',
                    id: '/_middleware',
                    sourcePage: 'middleware',
                    assets,
                    assetsHashes,
                    type: _constants.AdapterOutputType.MIDDLEWARE,
                    runtime: 'nodejs',
                    filePath: middlewareFile,
                    config: {
                        matchers: ((_functionConfig_matchers = functionConfig.matchers) == null ? void 0 : _functionConfig_matchers.map((item)=>{
                            return {
                                source: item.originalSource,
                                sourceRegex: item.regexp,
                                has: item.has,
                                missing: [
                                    ...item.missing || [],
                                    // always skip middleware for on-demand revalidate
                                    {
                                        type: 'header',
                                        key: 'x-prerender-revalidate',
                                        value: previewProps.previewModeId
                                    }
                                ]
                            };
                        })) || []
                    }
                };
            }
            const appOutputMap = {};
            const appDistDir = _path.default.join(distDir, 'server', 'app');
            if (appPageKeys) {
                for (const page of orderAppPageKeysByEntry(appPageKeys)){
                    var _config_i18n_locales, _config_i18n1;
                    if (middlewareManifest.functions.hasOwnProperty(page)) {
                        continue;
                    }
                    const normalizedPage = (0, _apppaths.normalizeAppPath)(page);
                    // Skip static metadata routes only when they are prerendered.
                    // Dynamic metadata routes (e.g. robots/sitemap using connection())
                    // should remain app routes in adapter outputs.
                    const isStaticMetadataRoute = (0, _ismetadataroute.isStaticMetadataFile)(normalizedPage);
                    const staticMetadataPrerenderPathname = (0, _getmetadataroute.getStaticMetadataPrerenderPathname)(normalizedPage) ?? normalizedPage;
                    const isPrerenderedMetadataRoute = prerenderManifest.routes[staticMetadataPrerenderPathname] || ((_config_i18n1 = config.i18n) == null ? void 0 : (_config_i18n_locales = _config_i18n1.locales) == null ? void 0 : _config_i18n_locales.some((locale)=>{
                        const localePathname = _path.default.posix.join('/', locale, staticMetadataPrerenderPathname.slice(1));
                        return prerenderManifest.routes[localePathname];
                    }));
                    if (isStaticMetadataRoute && isPrerenderedMetadataRoute) {
                        continue;
                    }
                    const pageFile = _path.default.join(appDistDir, `${page}.js`);
                    let { assets, assetsHashes } = await handleTraceFiles(pageFile, 'app').catch((err)=>{
                        _log.warn(`Failed to copy traced files for ${pageFile}`, err);
                        return {
                            assets: {},
                            assetsHashes: {}
                        };
                    });
                    // If this is a parallel route we just need to merge
                    // the assets as they share the same pathname
                    const existingOutput = appOutputMap[normalizedPage];
                    if (existingOutput) {
                        Object.assign(existingOutput.assets, assets);
                        Object.assign(existingOutput.assetsHashes, assetsHashes);
                        await pushAsset(existingOutput.assets, existingOutput.assetsHashes, _path.default.relative(repoRoot, pageFile), pageFile, bundler, config.outputHashSalt || '');
                        continue;
                    }
                    const functionConfig = functionsConfigManifest.functions[normalizedPage] || {};
                    const output = {
                        pathname: normalizedPage,
                        id: normalizedPage,
                        sourcePage: page,
                        assets,
                        assetsHashes,
                        type: page.endsWith('/route') ? _constants.AdapterOutputType.APP_ROUTE : _constants.AdapterOutputType.APP_PAGE,
                        runtime: 'nodejs',
                        filePath: pageFile,
                        config: {
                            maxDuration: functionConfig.maxDuration,
                            preferredRegion: functionConfig.regions
                        }
                    };
                    appOutputMap[normalizedPage] = output;
                    if (output.type === _constants.AdapterOutputType.APP_PAGE) {
                        outputs.appPages.push({
                            ...output,
                            pathname: (0, _normalizepagepath.normalizePagePath)(output.pathname) + '.rsc',
                            id: (0, _normalizepagepath.normalizePagePath)(output.pathname) + '.rsc'
                        });
                        outputs.appPages.push(output);
                    } else {
                        outputs.appRoutes.push(output);
                        outputs.appRoutes.push({
                            ...output,
                            pathname: (0, _normalizepagepath.normalizePagePath)(output.pathname) + '.rsc',
                            id: (0, _normalizepagepath.normalizePagePath)(output.pathname) + '.rsc'
                        });
                    }
                }
            }
            const getParentOutput = (srcRoute, childRoute, allowMissing)=>{
                var _config_i18n;
                const normalizedSrcRoute = (0, _normalizelocalepath.normalizeLocalePath)(srcRoute, ((_config_i18n = config.i18n) == null ? void 0 : _config_i18n.locales) || []).pathname;
                const parentOutput = pageOutputMap[normalizedSrcRoute] || appOutputMap[normalizedSrcRoute];
                if (!parentOutput && !allowMissing) {
                    console.error({
                        appOutputs: Object.keys(appOutputMap),
                        pageOutputs: Object.keys(pageOutputMap)
                    });
                    throw new Error(`Invariant: failed to find source route ${srcRoute} for prerender ${childRoute}`);
                }
                return parentOutput;
            };
            const sourcesWithOpenFallbacks = new Set();
            for (const [pathname, route] of Object.entries(prerenderManifest.dynamicRoutes)){
                if (route.fallback !== false) {
                    sourcesWithOpenFallbacks.add(route.fallbackSourceRoute ?? pathname);
                }
            }
            const { prefetchSegmentDirSuffix, prefetchSegmentSuffix, varyHeader, didPostponeHeader, contentTypeHeader: rscContentTypeHeader } = routesManifest.rsc;
            const appSourcePages = new Map();
            const getPrerenderFilePath = (route, isAppPage, extension)=>{
                if (config.output !== 'export') {
                    var _config_i18n;
                    route = _path.default.posix.join('/', route);
                    const pathname = isAppPage ? route : (0, _normalizelocalepath.normalizeLocalePath)(route, (_config_i18n = config.i18n) == null ? void 0 : _config_i18n.locales).pathname;
                    const prerender = prerenderManifest.routes[route];
                    const dynamicPrerender = prerenderManifest.dynamicRoutes[pathname];
                    // Auto-static Pages and generated error documents are not response
                    // cache entries and retain their public filenames.
                    if (!isAppPage && !prerender && !dynamicPrerender) {
                        return _path.default.join(pagesDistDir, `${(0, _normalizepagepath.normalizePagePath)(route)}${extension}`);
                    }
                    const source = (prerender == null ? void 0 : prerender.srcRoute) ?? (dynamicPrerender == null ? void 0 : dynamicPrerender.fallbackSourceRoute) ?? pathname;
                    let page = source;
                    let kind = _routekind.RouteKind.PAGES;
                    if (isAppPage) {
                        page = appSourcePages.get(source) ?? (0, _apppaths.selectAppPageEntry)(source, appPageKeys ?? []);
                        appSourcePages.set(source, page);
                        kind = page.endsWith('/route') ? _routekind.RouteKind.APP_ROUTE : _routekind.RouteKind.APP_PAGE;
                    }
                    return _path.default.join(distDir, 'server', `${(0, _routecachekey.getRouteCacheKey)(route, {
                        kind,
                        sourceRoute: page
                    })}${extension}`);
                }
                return _path.default.join(isAppPage ? appDistDir : pagesDistDir, `${(0, _normalizepagepath.normalizePagePath)(route)}${extension}`);
            };
            const handleAppMeta = async (route, initialOutput, meta, ctx)=>{
                if (meta.postponed && initialOutput.fallback) {
                    initialOutput.fallback.postponedState = meta.postponed;
                }
                if (meta == null ? void 0 : meta.segmentPaths) {
                    const normalizedRoute = (0, _normalizepagepath.normalizePagePath)(route);
                    const segmentsDir = getPrerenderFilePath(route, true, prefetchSegmentDirSuffix);
                    // If client param parsing is enabled, we follow the same logic as
                    // the HTML allowQuery as it's already going to vary based on if
                    // there's a static shell generated or if there's fallback root
                    // params. If there are fallback root params, and we can serve a
                    // fallback, then we should follow the same logic for the segment
                    // prerenders.
                    //
                    // If client param parsing is not enabled, we have to use the
                    // allowQuery because the segment payloads will contain dynamic
                    // segment values.
                    const segmentAllowQuery = routesManifest.rsc.clientParamParsing ? ctx.htmlAllowQuery : ctx.dataAllowQuery;
                    for (const segmentPath of meta.segmentPaths){
                        var _initialOutput_fallback, _initialOutput_fallback1, _initialOutput_fallback2;
                        const outputSegmentPath = _path.default.join(normalizedRoute + prefetchSegmentDirSuffix, segmentPath) + prefetchSegmentSuffix;
                        // Only use the fallback value when the allowQuery is defined and
                        // either: (1) it is empty, meaning segments do not vary by params,
                        // or (2) client param parsing is enabled, meaning the segment
                        // payloads are safe to reuse across params.
                        const shouldAttachSegmentFallback = segmentAllowQuery && (segmentAllowQuery.length === 0 || routesManifest.rsc.clientParamParsing);
                        const fallbackPathname = shouldAttachSegmentFallback ? _path.default.join(segmentsDir, segmentPath + prefetchSegmentSuffix) : undefined;
                        outputs.prerenders.push({
                            id: outputSegmentPath,
                            pathname: outputSegmentPath,
                            type: _constants.AdapterOutputType.PRERENDER,
                            parentOutputId: initialOutput.parentOutputId,
                            groupId: initialOutput.groupId,
                            route: initialOutput.route,
                            config: {
                                ...initialOutput.config,
                                bypassFor: undefined,
                                partialFallback: initialOutput.config.partialFallback
                            },
                            fallback: {
                                filePath: fallbackPathname,
                                postponedState: undefined,
                                initialExpiration: (_initialOutput_fallback = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback.initialExpiration,
                                initialRevalidate: (_initialOutput_fallback1 = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback1.initialRevalidate,
                                initialHeaders: {
                                    ...meta.headers,
                                    ...(_initialOutput_fallback2 = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback2.initialHeaders,
                                    vary: varyHeader,
                                    'content-type': rscContentTypeHeader,
                                    [didPostponeHeader]: '2'
                                }
                            }
                        });
                    }
                }
            };
            let prerenderGroupId = 1;
            const getAppRouteMeta = async (route, isAppPage)=>{
                const meta = isAppPage ? JSON.parse(await _promises.default.readFile(getPrerenderFilePath(route, true, '.meta'), 'utf8').catch(()=>'{}')) : {};
                if (meta.headers) {
                    // normalize these for consistency
                    for (const key of Object.keys(meta.headers)){
                        const keyLower = key.toLowerCase();
                        let value = meta.headers[key];
                        // normalize values to strings (e.g. set-cookie can be an array)
                        if (Array.isArray(value)) {
                            value = value.join(', ');
                        } else if (typeof value !== 'string') {
                            value = String(value);
                        }
                        if (keyLower !== key) {
                            delete meta.headers[key];
                        }
                        meta.headers[keyLower] = value;
                    }
                }
                return meta;
            };
            const filePathCache = new Map();
            const cachedFilePathCheck = async (filePath)=>{
                if (filePathCache.has(filePath)) {
                    return filePathCache.get(filePath);
                }
                const newCheck = _promises.default.access(filePath).then(()=>true).catch(()=>false);
                filePathCache.set(filePath, newCheck);
                return newCheck;
            };
            for(const route in prerenderManifest.routes){
                var _routesManifest_dynamicRoutes_find;
                const { initialExpireSeconds: initialExpiration, initialRevalidateSeconds: initialRevalidate, initialHeaders, initialStatus, dataRoute, renderingMode, routeType, response, compute, htmlSize, allowHeader, experimentalBypassFor } = prerenderManifest.routes[route];
                const srcRoute = prerenderManifest.routes[route].srcRoute || route;
                const srcRouteInfo = prerenderManifest.dynamicRoutes[srcRoute];
                const isAppPage = Boolean(appOutputMap[srcRoute]) || srcRoute === '/_not-found';
                const isNotFoundTrue = prerenderManifest.notFoundRoutes.includes(route);
                let allowQuery;
                const routeKeys = (_routesManifest_dynamicRoutes_find = routesManifest.dynamicRoutes.find((item)=>item.page === srcRoute)) == null ? void 0 : _routesManifest_dynamicRoutes_find.routeKeys;
                if (!(0, _utils1.isDynamicRoute)(route)) {
                    // for non-dynamic routes we use an empty array since
                    // no query values bust the cache for non-dynamic prerenders
                    // prerendered paths also do not pass allowQuery as they match
                    // during handle: 'filesystem' so should not cache differently
                    // by query values
                    allowQuery = [];
                } else if (routeKeys) {
                    // if we have routeKeys in the routes-manifest we use those
                    // for allowQuery for dynamic routes
                    allowQuery = Object.values(routeKeys);
                }
                let filePath = getPrerenderFilePath(route, isAppPage, isAppPage && !dataRoute ? '.body' : '.html');
                // Check if this is a static metadata route (e.g., /favicon.ico, /icon.png, /opengraph-image.png)
                // These should be output as static files, not prerenders.
                if ((0, _ismetadataroute.isStaticMetadataFile)(route)) {
                    // For static metadata from app router, check if the .body file exists
                    const staticMetadataFilePath = getPrerenderFilePath(route, true, '.body');
                    if (await cachedFilePathCheck(staticMetadataFilePath)) {
                        outputs.staticFiles.push({
                            id: route,
                            pathname: route,
                            type: _constants.AdapterOutputType.STATIC_FILE,
                            filePath: staticMetadataFilePath,
                            immutableHash: undefined
                        });
                        continue;
                    }
                }
                // we use the static 404 for notFound: true if available
                // if not we do a blocking invoke on first request
                if (isNotFoundTrue && hasStatic404) {
                    var _config_i18n2;
                    const locale = config.i18n && (0, _normalizelocalepath.normalizeLocalePath)(route, (_config_i18n2 = config.i18n) == null ? void 0 : _config_i18n2.locales).detectedLocale;
                    for (const currentFilePath of [
                        getPrerenderFilePath(_path.default.posix.join('/', locale || '', '404'), false, '.html'),
                        getPrerenderFilePath('/404', false, '.html')
                    ]){
                        if (await cachedFilePathCheck(currentFilePath)) {
                            filePath = currentFilePath;
                            break;
                        }
                    }
                }
                const meta = await getAppRouteMeta(route, isAppPage);
                // If we already have a complete 404.html, favor that instead of the
                // _not-found prerender. A route with postponed state only produced a
                // shell, so preserve its prerender output in order to resume it.
                if (srcRoute === '/_not-found' && hasStatic404 && !meta.postponed) {
                    continue;
                }
                let htmlAllowQuery = allowQuery;
                let dataAllowQuery = allowQuery;
                const dataInitialHeaders = {};
                // We additionally vary based on if there's a postponed prerender
                // because if there isn't, then that means that we generated an
                // empty shell, and producing an empty RSC shell would be a waste.
                // If there is a postponed prerender, then the RSC shell would be
                // non-empty, and it would be valuable to also generate an empty
                // RSC shell.
                if (meta.postponed) {
                    htmlAllowQuery = [];
                    if (routesManifest.rsc.dynamicRSCPrerender) {
                        // If client param parsing is enabled, we follow the same logic as the
                        // HTML allowQuery as it's already going to vary based on if there's a
                        // static shell generated or if there's fallback root params. If there
                        // are fallback root params, and we can serve a fallback, then we
                        // should follow the same logic for the dynamic RSC routes.
                        //
                        // If client param parsing is not enabled, we have to use the
                        // allowQuery because the RSC payloads will contain dynamic segment
                        // values.
                        if (routesManifest.rsc.clientParamParsing) {
                            dataAllowQuery = htmlAllowQuery;
                        }
                    }
                }
                if (renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC) {
                    // Dynamic RSC requests cannot be cached, so we explicity set it
                    // here to ensure that the response is not cached by the browser.
                    dataInitialHeaders['cache-control'] = 'private, no-store, no-cache, max-age=0, must-revalidate';
                }
                const classification = getPrerenderClassification(route, routeType, response, compute, htmlSize);
                const initialOutput = {
                    id: route,
                    type: _constants.AdapterOutputType.PRERENDER,
                    pathname: route,
                    parentOutputId: srcRoute === '/_not-found' ? srcRoute : getParentOutput(srcRoute, route).id,
                    groupId: prerenderGroupId,
                    route: srcRoute,
                    pprChain: isAppPage && renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC ? {
                        headers: {
                            [_constants1.NEXT_RESUME_HEADER]: '1'
                        }
                    } : undefined,
                    // This describes the whole source page, not just its least-specific
                    // matcher. A closed prefix with an open suffix must remain callable
                    // for paths that weren't rendered at build time.
                    parentFallbackMode: (srcRouteInfo == null ? void 0 : srcRouteInfo.fallback) === false && sourcesWithOpenFallbacks.has(srcRoute) ? undefined : srcRouteInfo == null ? void 0 : srcRouteInfo.fallback,
                    fallback: !isNotFoundTrue || isNotFoundTrue && hasStatic404 ? {
                        filePath,
                        postponedState: undefined,
                        initialStatus: initialStatus ?? meta.status ?? (isNotFoundTrue ? 404 : undefined),
                        initialHeaders: {
                            ...initialHeaders,
                            vary: varyHeader,
                            'content-type': _constants1.HTML_CONTENT_TYPE_HEADER,
                            ...meta.headers
                        },
                        initialExpiration,
                        initialRevalidate: typeof initialRevalidate === 'undefined' ? 1 : initialRevalidate
                    } : undefined,
                    config: {
                        allowQuery,
                        allowHeader,
                        renderingMode,
                        bypassFor: isAppPage && srcRoute !== '/_not-found' ? experimentalBypassFor : undefined,
                        bypassToken: previewProps.previewModeId
                    }
                };
                // Classification describes the primary HTML or Route Handler body,
                // not the related RSC/data/segment outputs that spread initialOutput.
                // The shallow spread shares `fallback` by reference, so
                // handleAppMeta's postponedState mutation still reaches this output.
                outputs.prerenders.push({
                    ...initialOutput,
                    ...classification
                });
                if (!isAppPage && appPageKeys && appPageKeys.length > 0) {
                    const rscPage = `${route === '/' ? '/index' : route}.rsc`;
                    outputs.staticFiles.push({
                        id: rscPage,
                        pathname: rscPage,
                        type: _constants.AdapterOutputType.STATIC_FILE,
                        filePath: rscFallbackPath,
                        immutableHash: undefined
                    });
                }
                if (dataRoute) {
                    const dataFilePath = getPrerenderFilePath(route, isAppPage, isAppPage ? '.rsc' : '.json');
                    let postponed = meta.postponed;
                    if (renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC && !await cachedFilePathCheck(dataFilePath)) {
                        var _initialOutput_fallback;
                        outputs.prerenders.push({
                            ...initialOutput,
                            id: dataRoute,
                            pathname: dataRoute,
                            fallback: {
                                ...initialOutput.fallback,
                                postponedState: postponed,
                                initialStatus: undefined,
                                initialHeaders: {
                                    ...(_initialOutput_fallback = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback.initialHeaders,
                                    ...dataInitialHeaders,
                                    'content-type': isAppPage ? rscContentTypeHeader : _constants1.JSON_CONTENT_TYPE_HEADER
                                },
                                filePath: undefined
                            }
                        });
                    } else {
                        var _initialOutput_fallback1;
                        outputs.prerenders.push({
                            ...initialOutput,
                            id: dataRoute,
                            pathname: dataRoute,
                            fallback: isNotFoundTrue ? undefined : {
                                ...initialOutput.fallback,
                                initialStatus: undefined,
                                initialHeaders: {
                                    ...(_initialOutput_fallback1 = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback1.initialHeaders,
                                    ...dataInitialHeaders,
                                    'content-type': isAppPage ? rscContentTypeHeader : _constants1.JSON_CONTENT_TYPE_HEADER
                                },
                                postponedState: undefined,
                                filePath: dataFilePath
                            }
                        });
                    }
                }
                if (isAppPage) {
                    await handleAppMeta(route, initialOutput, meta, {
                        htmlAllowQuery,
                        dataAllowQuery
                    });
                }
                prerenderGroupId += 1;
            }
            for(const dynamicRoute in prerenderManifest.dynamicRoutes){
                var _routesManifest_dynamicRoutes_find1;
                if ((0, _ismetadataroute.isStaticMetadataFile)(dynamicRoute)) {
                    continue;
                }
                const { fallback, fallbackExpire, fallbackRevalidate, fallbackHeaders, fallbackStatus, fallbackSourceRoute, fallbackRootParams, remainingPrerenderableParams, allowHeader, dataRoute, renderingMode, routeType, response, compute, htmlSize, experimentalBypassFor } = prerenderManifest.dynamicRoutes[dynamicRoute];
                const srcRoute = fallbackSourceRoute || dynamicRoute;
                const parentOutput = getParentOutput(srcRoute, dynamicRoute);
                const isAppPage = Boolean(appOutputMap[srcRoute]);
                const meta = await getAppRouteMeta(dynamicRoute, isAppPage);
                const routeKeys = ((_routesManifest_dynamicRoutes_find1 = routesManifest.dynamicRoutes.find((item)=>item.page === dynamicRoute)) == null ? void 0 : _routesManifest_dynamicRoutes_find1.routeKeys) || {};
                const allowQuery = Object.values(routeKeys);
                const partialFallback = // Partial fallback shells are only emitted when Partial Prefetching
                // is enabled in the app's Next.js config.
                Boolean(config.partialPrefetching) && isAppPage && remainingPrerenderableParams !== undefined && remainingPrerenderableParams.length > 0 && renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC && typeof fallback === 'string' && Boolean(meta.postponed);
                const canEmitPartialFallback = partialFallback && (fallbackRootParams == null ? void 0 : fallbackRootParams.length) === 0;
                let htmlAllowQuery = allowQuery;
                let didFilterBlockingAllowQuery = false;
                // We only want to vary on the shell contents if there is a fallback
                // present and able to be served.
                if (typeof fallback === 'string') {
                    if (fallbackRootParams && fallbackRootParams.length > 0) {
                        htmlAllowQuery = fallbackRootParams.map((paramName)=>`${_constants1.NEXT_QUERY_PARAM_PREFIX}${paramName}`);
                    } else if (meta.postponed) {
                        // If there's postponed fallback content, we usually collapse to a shared shell (`[]`).
                        // For partial fallbacks in cache components, keep only the
                        // params that can still complete this shell.
                        const remainingPrerenderableQueryKeys = new Set((remainingPrerenderableParams ?? []).map((param)=>`${_constants1.NEXT_QUERY_PARAM_PREFIX}${param.paramName}`));
                        htmlAllowQuery = canEmitPartialFallback && routesManifest.rsc.clientParamParsing ? Object.values(routeKeys).filter((routeKey)=>remainingPrerenderableQueryKeys.has(routeKey)) : [];
                    }
                } else if (fallback === null && isAppPage && renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC && routesManifest.rsc.clientParamParsing && remainingPrerenderableParams !== undefined) {
                    // BLOCKING entries (no servable fallback) still cache their
                    // on-demand renders, so the same cache-key contract applies as for
                    // partial fallbacks: only params that `generateStaticParams` can
                    // still provide may partition the cache — root params (which are
                    // always provided) and the remaining prerenderable params.
                    // Including a never-prerenderable param would create a cache entry
                    // per param value and resolve the param into the cached content,
                    // so it must be stripped from the request instead, which defers it
                    // to a per-request resume.
                    const prerenderableQueryKeys = new Set();
                    for (const paramName of fallbackRootParams ?? []){
                        prerenderableQueryKeys.add(`${_constants1.NEXT_QUERY_PARAM_PREFIX}${paramName}`);
                    }
                    for (const param of remainingPrerenderableParams){
                        prerenderableQueryKeys.add(`${_constants1.NEXT_QUERY_PARAM_PREFIX}${param.paramName}`);
                    }
                    htmlAllowQuery = allowQuery.filter((routeKey)=>prerenderableQueryKeys.has(routeKey));
                    didFilterBlockingAllowQuery = true;
                }
                // app router dynamic route fallbacks don't have the extension so
                // ensure it's added here
                const fallbackHtmlFile = typeof fallback === 'string' ? fallback.endsWith('.html') ? fallback : `${fallback}.html` : undefined;
                const fallbackHtmlPath = fallbackHtmlFile !== undefined ? getPrerenderFilePath(fallbackHtmlFile.replace(/\.html$/, ''), isAppPage, '.html') : undefined;
                const classification = getPrerenderClassification(dynamicRoute, routeType, response, compute, htmlSize);
                const initialOutput = {
                    id: dynamicRoute,
                    type: _constants.AdapterOutputType.PRERENDER,
                    pathname: dynamicRoute,
                    parentOutputId: parentOutput.id,
                    groupId: prerenderGroupId,
                    route: srcRoute,
                    pprChain: isAppPage && renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC ? {
                        headers: {
                            [_constants1.NEXT_RESUME_HEADER]: '1'
                        }
                    } : undefined,
                    fallback: fallbackHtmlPath !== undefined ? {
                        filePath: fallbackHtmlPath,
                        postponedState: undefined,
                        initialStatus: fallbackStatus ?? meta.status,
                        initialHeaders: {
                            ...fallbackHeaders,
                            ...(appPageKeys == null ? void 0 : appPageKeys.length) ? {
                                vary: varyHeader
                            } : {},
                            'content-type': _constants1.HTML_CONTENT_TYPE_HEADER,
                            ...meta.headers
                        },
                        initialExpiration: fallbackExpire,
                        initialRevalidate: fallbackRevalidate ?? 1
                    } : undefined,
                    config: {
                        allowQuery: htmlAllowQuery,
                        allowHeader,
                        renderingMode,
                        partialFallback: canEmitPartialFallback || undefined,
                        bypassFor: isAppPage ? experimentalBypassFor : undefined,
                        bypassToken: previewProps.previewModeId
                    }
                };
                if (!config.i18n || isAppPage) {
                    // Classification describes only the primary HTML response, not the
                    // related RSC/data/segment outputs that spread initialOutput. The
                    // shallow spread shares `fallback` by reference, so handleAppMeta's
                    // postponedState mutation still reaches this output.
                    outputs.prerenders.push({
                        ...initialOutput,
                        ...classification
                    });
                    if (!isAppPage && fallback !== false && appPageKeys && appPageKeys.length > 0) {
                        const rscPage = `${srcRoute === '/' ? '/index' : srcRoute}.rsc`;
                        outputs.staticFiles.push({
                            id: rscPage,
                            pathname: rscPage,
                            type: _constants.AdapterOutputType.STATIC_FILE,
                            filePath: rscFallbackPath,
                            immutableHash: undefined
                        });
                    }
                    let dataAllowQuery = allowQuery;
                    const dataInitialHeaders = {};
                    if (meta.postponed && routesManifest.rsc.dynamicRSCPrerender) {
                        // If client param parsing is enabled, we follow the same logic as the
                        // HTML allowQuery as it's already going to vary based on if there's a
                        // static shell generated or if there's fallback root params. If there
                        // are fallback root params, and we can serve a fallback, then we
                        // should follow the same logic for the dynamic RSC routes.
                        //
                        // If client param parsing is not enabled, we have to use the
                        // allowQuery because the RSC payloads will contain dynamic segment
                        // values.
                        if (routesManifest.rsc.clientParamParsing) {
                            dataAllowQuery = htmlAllowQuery;
                        }
                    } else if (didFilterBlockingAllowQuery) {
                        // Blocking entries have no fallback shell whose presence could
                        // make the data route vary differently from the HTML route: the
                        // on-demand data render is cached under the same
                        // prerenderable-params-only contract.
                        dataAllowQuery = htmlAllowQuery;
                    }
                    if (renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC) {
                        // Dynamic RSC requests cannot be cached, so we explicity set it
                        // here to ensure that the response is not cached by the browser.
                        dataInitialHeaders['cache-control'] = 'private, no-store, no-cache, max-age=0, must-revalidate';
                    }
                    if (isAppPage) {
                        await handleAppMeta(dynamicRoute, initialOutput, meta, {
                            htmlAllowQuery,
                            dataAllowQuery
                        });
                    }
                    if (renderingMode === _renderingmode.RenderingMode.PARTIALLY_STATIC) {
                        var _initialOutput_fallback2;
                        outputs.prerenders.push({
                            ...initialOutput,
                            id: `${dynamicRoute}.rsc`,
                            pathname: `${dynamicRoute}.rsc`,
                            fallback: {
                                ...initialOutput.fallback,
                                filePath: undefined,
                                postponedState: meta.postponed,
                                initialStatus: undefined,
                                initialHeaders: {
                                    ...(_initialOutput_fallback2 = initialOutput.fallback) == null ? void 0 : _initialOutput_fallback2.initialHeaders,
                                    ...dataInitialHeaders,
                                    'content-type': isAppPage ? rscContentTypeHeader : _constants1.JSON_CONTENT_TYPE_HEADER
                                }
                            },
                            config: {
                                ...initialOutput.config,
                                allowQuery: dataAllowQuery,
                                partialFallback: undefined
                            }
                        });
                    } else if (dataRoute) {
                        outputs.prerenders.push({
                            ...initialOutput,
                            id: dataRoute,
                            pathname: dataRoute,
                            fallback: undefined,
                            config: {
                                ...initialOutput.config,
                                partialFallback: undefined
                            }
                        });
                    }
                    prerenderGroupId += 1;
                } else {
                    for (const locale of config.i18n.locales){
                        const currentOutput = {
                            ...initialOutput,
                            pathname: _path.default.posix.join(`/${locale}`, initialOutput.pathname),
                            id: _path.default.posix.join(`/${locale}`, initialOutput.id),
                            fallback: fallbackHtmlFile !== undefined ? {
                                ...initialOutput.fallback,
                                initialStatus: undefined,
                                postponedState: undefined,
                                filePath: getPrerenderFilePath(_path.default.posix.join('/', locale, fallbackHtmlFile.replace(/\.html$/, '')), false, '.html')
                            } : undefined,
                            groupId: prerenderGroupId
                        };
                        outputs.prerenders.push(currentOutput);
                        if (!isAppPage && fallback !== false && appPageKeys && appPageKeys.length > 0) {
                            const rscPage = `${_path.default.posix.join(`/${locale}`, initialOutput.pathname)}.rsc`;
                            outputs.staticFiles.push({
                                id: rscPage,
                                pathname: rscPage,
                                type: _constants.AdapterOutputType.STATIC_FILE,
                                filePath: rscFallbackPath,
                                immutableHash: undefined
                            });
                        }
                        if (dataRoute) {
                            const dataPathname = _path.default.posix.join(`/_next/data`, buildId, locale, dynamicRoute + '.json');
                            outputs.prerenders.push({
                                ...initialOutput,
                                id: dataPathname,
                                pathname: dataPathname,
                                // data route doesn't have skeleton fallback
                                fallback: undefined,
                                config: {
                                    ...initialOutput.config,
                                    partialFallback: undefined
                                },
                                groupId: prerenderGroupId
                            });
                        }
                        prerenderGroupId += 1;
                    }
                }
            }
            // ensure 404
            const staticErrorDocs = [
                ...hasStatic404 ? [
                    '/404'
                ] : [],
                ...hasStatic500 ? [
                    '/500'
                ] : []
            ];
            for (const errorDoc of staticErrorDocs){
                var _config_i18n3;
                const errorDocPath = _path.default.posix.join('/', ((_config_i18n3 = config.i18n) == null ? void 0 : _config_i18n3.defaultLocale) || '', errorDoc);
                if (!prerenderManifest.routes[errorDocPath]) {
                    var _config_i18n_locales1, _config_i18n4;
                    for (const currentDocPath of [
                        errorDocPath,
                        ...((_config_i18n4 = config.i18n) == null ? void 0 : (_config_i18n_locales1 = _config_i18n4.locales) == null ? void 0 : _config_i18n_locales1.filter((locale)=>{
                            var _config_i18n;
                            return locale !== ((_config_i18n = config.i18n) == null ? void 0 : _config_i18n.defaultLocale);
                        }).map((locale)=>_path.default.posix.join('/', locale, errorDoc))) || []
                    ]){
                        // skip if this static file was already emitted for an
                        // auto-static-optimized page above to avoid duplicate entries
                        if (emittedStaticFilePathnames.has(currentDocPath)) {
                            continue;
                        }
                        const currentFilePath = _path.default.join(pagesDistDir, `${currentDocPath}.html`);
                        if (await cachedFilePathCheck(currentFilePath)) {
                            outputs.staticFiles.push({
                                pathname: currentDocPath,
                                id: currentDocPath,
                                type: _constants.AdapterOutputType.STATIC_FILE,
                                filePath: currentFilePath,
                                immutableHash: undefined
                            });
                        }
                    }
                }
            }
        }
        normalizePathnames(config, outputs);
        const dynamicRoutes = [];
        const dynamicDataRoutes = [];
        const dynamicSegmentRoutes = [];
        const getDestinationQuery = (routeKeys)=>{
            const items = Object.entries(routeKeys ?? {});
            if (items.length === 0) return '';
            return '?' + items.map(([key, value])=>`${value}=$${key}`).join('&');
        };
        // The valid bypass token admits both Draft Mode and legacy Preview Mode.
        // Pages Router validates legacy preview data after routing.
        const fallbackFalseHasCondition = [
            {
                type: 'cookie',
                key: '__prerender_bypass',
                value: previewProps.previewModeId
            }
        ];
        // Without this collapse the loop below emits one entry per shell.
        const fallbackShellRuns = config.experimental.collapseAdapterRoutes ? (0, _fallbackshellruns.collectFallbackShellRuns)(routesManifest.dynamicRoutes, (page)=>{
            var _prerenderManifest_dynamicRoutes_page;
            return ((_prerenderManifest_dynamicRoutes_page = prerenderManifest.dynamicRoutes[page]) == null ? void 0 : _prerenderManifest_dynamicRoutes_page.fallback) === false;
        }) : undefined;
        const escapedBasePath = config.basePath && config.basePath !== '/' ? (0, _escaperegexp.escapeStringRegexp)(_path.default.posix.join('/', config.basePath)) : '';
        for (const route of routesManifest.dynamicRoutes){
            var _prerenderManifest_dynamicRoutes_route_page;
            // An earlier entry in this loop serves this shell.
            if (fallbackShellRuns == null ? void 0 : fallbackShellRuns.replacedPages.has(route.page)) {
                continue;
            }
            const fallbackShellRun = fallbackShellRuns == null ? void 0 : fallbackShellRuns.byRepresentativePage.get(route.page);
            const shouldLocalize = Boolean(config.i18n);
            const routeRegex = (0, _routeregex.getNamedRouteRegex)(route.page, {
                prefixRouteKeys: true
            });
            const isFallbackFalse = ((_prerenderManifest_dynamicRoutes_route_page = prerenderManifest.dynamicRoutes[route.page]) == null ? void 0 : _prerenderManifest_dynamicRoutes_route_page.fallback) === false;
            // An entry for a whole run of shells matches every prefix in that run.
            // The destination copies the prefix that matched.
            //
            // The prefix and RSC suffix use unnamed captures. Adapters can forward
            // named captures to the application query when they bypass prerendered
            // output.
            //
            // This replacement runs on the pattern for the page, and `sourceRegex`
            // below prefixes the result with the base path and the locale group. That
            // order is deliberate. The search text anchors at `^`, and here that
            // anchor is the start of the page path. On `sourceRegex` the same anchor
            // is the start of the base path. A replacement there would match a base
            // path such as `/de/x`, and it would rewrite that base path instead of
            // the page path.
            const pagePattern = fallbackShellRun ? routeRegex.namedRegex.replace(`^/${(0, _escaperegexp.escapeStringRegexp)(fallbackShellRun.prefixes[0])}/`, ()=>`^/(${fallbackShellRun.prefixes.map((prefix)=>(0, _escaperegexp.escapeStringRegexp)(prefix)).join('|')})/`) : routeRegex.namedRegex;
            const pagePath = fallbackShellRun ? _path.default.posix.join('/', shouldLocalize ? '$2' : '$1', fallbackShellRun.tail) : route.page;
            const sourceRegex = pagePattern.replace('^', ()=>`^${escapedBasePath}[/]?${shouldLocalize ? '(?<nextLocale>[^/]{1,})' : ''}`);
            const destination = _path.default.posix.join('/', config.basePath, shouldLocalize ? '/$nextLocale' : '', pagePath) + getDestinationQuery(route.routeKeys);
            // Count capture names, not parameter names. An interception route can
            // capture the same parameter with both nxtP and nxtI names.
            const suffixCaptureIndex = Object.keys(routeRegex.routeKeys).length + (shouldLocalize ? 1 : 0) + (fallbackShellRun ? 1 : 0) + 1;
            const hasAppPages = Boolean(appPageKeys && appPageKeys.length > 0);
            const suffixedHas = isFallbackFalse && !pageKeys.includes(route.page) ? fallbackFalseHasCondition : undefined;
            const plainHas = isFallbackFalse ? fallbackFalseHasCondition : undefined;
            // A single entry can serve both forms of the request only when both carry
            // the same conditions. A pages router route with `fallback: false` is the
            // one case where they differ: it requires the bypass cookie on the
            // plain form, and not on the suffixed form. An entry holds one set of
            // conditions, so that case keeps a separate entry per form.
            const canMergeSuffixedAndPlain = config.experimental.collapseAdapterRoutes && hasAppPages && suffixedHas === plainHas;
            if (canMergeSuffixedAndPlain) {
                // One entry serves every form of a request for this page:
                //
                // - The document at the page path.
                // - The `.rsc` payload.
                // - A per-segment prefetch.
                //
                // The suffix group ends with an empty alternative. The group therefore
                // always matches, and it captures an empty string for a request that
                // carries no suffix. The destination copies what the group captured.
                //
                // An optional group is unsafe here. An adapter, or the router that
                // consumes its output, can resolve the placeholders in a destination
                // from the match result rather than from the pattern. A group that does
                // not match is then absent from that result, and the destination
                // placeholder stays unresolved.
                dynamicRoutes.push({
                    source: pagePath,
                    sourceRegex: sourceRegex.replace(new RegExp((0, _escaperegexp.escapeStringRegexp)('(?:/)?$')), '(\\.rsc|\\.segments/.+\\.segment\\.rsc|)(?:/)?$'),
                    destination: destination.replace(/($|\?)/, (separator)=>`$${suffixCaptureIndex}${separator}`),
                    has: plainHas,
                    missing: undefined
                });
            } else {
                // This route serves two kinds of request for the page: a request for
                // the `.rsc` payload, and a per-segment prefetch request. The suffix
                // group accepts both forms, and the destination copies the matched
                // suffix, so each request resolves to the artifact that it asks for.
                if (hasAppPages) {
                    dynamicRoutes.push({
                        source: pagePath + '.rsc',
                        sourceRegex: sourceRegex.replace(new RegExp((0, _escaperegexp.escapeStringRegexp)('(?:/)?$')), '(\\.rsc|\\.segments/.+\\.segment\\.rsc)(?:/)?$'),
                        destination: destination.replace(/($|\?)/, (separator)=>`$${suffixCaptureIndex}${separator}`),
                        has: suffixedHas,
                        missing: undefined
                    });
                }
                // needs basePath and locale handling if pages router
                dynamicRoutes.push({
                    source: pagePath,
                    sourceRegex,
                    destination,
                    has: plainHas,
                    missing: undefined
                });
            }
            // The entry above resolves a per-segment request on its own, because its
            // suffix group accepts a segment path. A build that turns the collapse
            // off emits a dedicated route for each segment, and the table lists those
            // before that entry.
            if (!config.experimental.collapseAdapterRoutes) {
                for (const segmentRoute of route.prefetchSegmentDataRoutes || []){
                    dynamicSegmentRoutes.push({
                        source: route.page,
                        sourceRegex: segmentRoute.source.replace('^', ()=>`^${escapedBasePath}[/]?`),
                        destination: _path.default.posix.join('/', config.basePath, segmentRoute.destination + getDestinationQuery(segmentRoute.routeKeys)),
                        has: undefined,
                        missing: undefined
                    });
                }
            }
        }
        const needsMiddlewareResolveRoutes = outputs.middleware && outputs.pages.length > 0;
        const dataRoutePages = new Set([
            ...routesManifest.dataRoutes.map((item)=>item.page)
        ]);
        const sortedDataPages = (0, _sortableroutes.sortSortableRoutes)([
            ...needsMiddlewareResolveRoutes ? [
                ...staticPages
            ].map((page)=>({
                    sourcePage: page,
                    page
                })) : [],
            ...routesManifest.dataRoutes.map((item)=>({
                    sourcePage: item.page,
                    page: item.page
                }))
        ]);
        for (const { page } of sortedDataPages){
            if (needsMiddlewareResolveRoutes || (0, _utils1.isDynamicRoute)(page)) {
                var _prerenderManifest_dynamicRoutes_page;
                const shouldLocalize = config.i18n;
                const isFallbackFalse = ((_prerenderManifest_dynamicRoutes_page = prerenderManifest.dynamicRoutes[page]) == null ? void 0 : _prerenderManifest_dynamicRoutes_page.fallback) === false;
                const routeRegex = (0, _routeregex.getNamedRouteRegex)(page + '.json', {
                    prefixRouteKeys: true,
                    includeSuffix: true
                });
                const isDataRoute = dataRoutePages.has(page);
                const destination = _path.default.posix.join('/', config.basePath, ...isDataRoute ? [
                    `_next/data`,
                    buildId
                ] : '', ...page === '/' ? [
                    shouldLocalize ? '$nextLocale.json' : 'index.json'
                ] : [
                    shouldLocalize ? '$nextLocale' : '',
                    page + (isDataRoute ? '.json' : '') + getDestinationQuery(routeRegex.routeKeys || {})
                ]);
                dynamicDataRoutes.push({
                    source: page,
                    sourceRegex: shouldLocalize && page === '/' ? '^' + _path.default.posix.join('/', config.basePath, '_next/data', (0, _escaperegexp.escapeStringRegexp)(buildId), '(?<nextLocale>[^/]{1,}).json') : routeRegex.namedRegex.replace('^', `^${_path.default.posix.join('/', config.basePath, `_next/data`, (0, _escaperegexp.escapeStringRegexp)(buildId))}[/]?${shouldLocalize ? '(?<nextLocale>[^/]{1,})' : ''}`),
                    destination,
                    has: isFallbackFalse ? fallbackFalseHasCondition : undefined,
                    missing: undefined
                });
            }
        }
        const buildRewriteItem = (route)=>{
            const converted = (0, _routingutils.convertRewrites)([
                route
            ], [
                'nextInternalLocale'
            ])[0];
            const regex = converted.src || route.regex;
            return {
                source: route.source,
                sourceRegex: route.internal ? regex : (0, _redirectstatus.modifyRouteRegex)(regex),
                destination: converted.dest || route.destination,
                has: route.has,
                missing: route.missing
            };
        };
        const buildRouteFromHeader = (route)=>{
            const converted = (0, _routingutils.convertHeaders)([
                route
            ])[0];
            const regex = converted.src || route.regex;
            return {
                source: route.source,
                sourceRegex: route.internal ? regex : (0, _redirectstatus.modifyRouteRegex)(regex),
                headers: 'headers' in converted ? converted.headers || {} : {},
                has: route.has,
                missing: route.missing,
                priority: route.internal || undefined
            };
        };
        try {
            var _outputs_middleware_config_matchers, _outputs_middleware;
            _log.info(`Running onBuildComplete from ${adapterMod.name}`);
            const combinedDynamicRoutes = [
                ...dynamicDataRoutes,
                ...dynamicSegmentRoutes,
                ...dynamicRoutes
            ];
            const rewrites = {
                beforeFiles: routesManifest.rewrites.beforeFiles.map(buildRewriteItem),
                afterFiles: routesManifest.rewrites.afterFiles.map(buildRewriteItem),
                fallback: routesManifest.rewrites.fallback.map(buildRewriteItem)
            };
            const redirects = routesManifest.redirects.map((route)=>{
                const converted = (0, _routingutils.convertRedirects)([
                    route
                ], 307)[0];
                const regex = converted.src || route.regex;
                return {
                    source: route.source,
                    sourceRegex: route.internal ? regex : (0, _redirectstatus.modifyRouteRegex)(regex),
                    headers: 'headers' in converted ? converted.headers || {} : {},
                    status: converted.status || (0, _redirectstatus.getRedirectStatus)(route),
                    has: route.has,
                    missing: route.missing,
                    priority: route.internal || undefined
                };
            });
            const headers = routesManifest.headers.map((route)=>buildRouteFromHeader(route));
            const onMatchHeaders = routesManifest.onMatchHeaders.map((route)=>buildRouteFromHeader(route));
            await adapterMod.onBuildComplete({
                routing: {
                    beforeMiddleware: [
                        ...headers,
                        ...redirects
                    ],
                    middlewareMatchers: ((_outputs_middleware = outputs.middleware) == null ? void 0 : (_outputs_middleware_config_matchers = _outputs_middleware.config.matchers) == null ? void 0 : _outputs_middleware_config_matchers.map((matcher)=>({
                            source: matcher.source,
                            sourceRegex: matcher.sourceRegex,
                            has: matcher.has,
                            missing: matcher.missing
                        }))) ?? [],
                    beforeFiles: rewrites.beforeFiles,
                    afterFiles: rewrites.afterFiles,
                    dynamicRoutes: combinedDynamicRoutes,
                    onMatch: [
                        {
                            // This ensures we only match known emitted-by-Next.js files and not
                            // user-emitted files which may be missing a hash in their filename.
                            sourceRegex: `${_path.default.posix.join(config.basePath || '/', '_next/static', `/(?:[^/]+/pages|pages|chunks|immutable|runtime|css|image|media|${(0, _escaperegexp.escapeStringRegexp)(buildId)})/.+`)}`,
                            // Next.js assets contain a hash or entropy in their filenames, so they
                            // are guaranteed to be unique and cacheable indefinitely.
                            headers: {
                                'cache-control': `public,max-age=${_constants1.CACHE_ONE_YEAR_SECONDS},immutable`
                            }
                        },
                        ...onMatchHeaders
                    ],
                    fallback: rewrites.fallback,
                    shouldNormalizeNextData: !!needsMiddlewareResolveRoutes,
                    rsc: (0, _generateroutesmanifest.generateRoutesManifest)({
                        appType,
                        pageKeys: {
                            pages: pageKeys,
                            app: appPageKeys
                        },
                        config,
                        redirects: [],
                        headers: [],
                        onMatchHeaders: [],
                        rewrites,
                        restrictedRedirectPaths: [],
                        isAppPPREnabled: config.cacheComponents
                    }).routesManifest.rsc
                },
                outputs,
                config,
                distDir,
                buildId,
                nextVersion,
                projectDir: dir,
                repoRoot: repoRoot
            });
        } catch (err) {
            _log.error(`Failed to run onBuildComplete from ${adapterMod.name}`);
            throw err;
        }
    }
}
async function getSharedNodeAssets({ dir, bundler, distDir, repoRoot, outputFileTracingRoot, requiredServerFiles, hasInstrumentationHook, config, syntheticSymlinks }) {
    const sharedNodeAssets = {};
    const sharedNodeAssetsHashes = {};
    const pagesSharedNodeAssets = {};
    const pagesSharedNodeAssetsHashes = {};
    const appPagesSharedNodeAssets = {};
    const appPagesSharedNodeAssetsHashes = {};
    const salt = config.outputHashSalt || '';
    const moduleTypes = [
        'app-page',
        'pages'
    ];
    for (const type of moduleTypes){
        const currentDependencies = [];
        const modulePath = require.resolve(`next/dist/server/route-modules/${type}/module.compiled`);
        currentDependencies.push(modulePath);
        const contextDir = _path.default.join(_path.default.dirname(modulePath), 'vendored', 'contexts');
        for (const item of (await _promises.default.readdir(contextDir))){
            if (item.match(/\.(mjs|cjs|js)$/)) {
                currentDependencies.push(_path.default.join(contextDir, item));
            }
        }
        for (const dependencyPath of currentDependencies){
            const rootRelativeFilePath = _path.default.relative(repoRoot, dependencyPath);
            if (type === 'pages') {
                await pushAsset(pagesSharedNodeAssets, pagesSharedNodeAssetsHashes, rootRelativeFilePath, _path.default.join(repoRoot, rootRelativeFilePath), bundler, salt);
            } else {
                await pushAsset(appPagesSharedNodeAssets, appPagesSharedNodeAssetsHashes, rootRelativeFilePath, _path.default.join(repoRoot, rootRelativeFilePath), bundler, salt);
            }
        }
    }
    // add "next/setup-node-env" stub so it can be required top-level
    // TODO: should we make this always available without adapters
    const setupNodeStubPath = _path.default.join(_path.default.dirname(require.resolve('next/package.json')), 'setup-node-env.js');
    await pushAsset(sharedNodeAssets, sharedNodeAssetsHashes, _path.default.relative(repoRoot, setupNodeStubPath), require.resolve('next/dist/build/adapter/setup-node-env.external'), bundler, salt);
    // Turbopack traces these itself, they are listed in the nft.json files.
    if (bundler !== _bundler.Bundler.Turbopack) {
        const { nodeFileTrace } = require('next/dist/compiled/@vercel/nft');
        const { makeIgnoreFn } = require('../collect-build-traces');
        const sharedTraceIgnores = [
            '**/next/dist/compiled/next-server/**/*.dev.js',
            '**/next/dist/compiled/webpack/*',
            '**/node_modules/webpack5/**/*',
            '**/next/dist/server/lib/route-resolver*',
            'next/dist/compiled/semver/semver/**/*.js',
            '**/node_modules/react{,-dom,-dom-server-turbopack}/**/*.development.js',
            '**/*.d.ts',
            '**/*.map',
            '**/next/dist/pages/**/*',
            '**/node_modules/sharp/**/*',
            '**/@img/sharp-libvips*/**/*',
            '**/next/dist/compiled/edge-runtime/**/*',
            '**/next/dist/server/web/sandbox/**/*',
            '**/next/dist/server/post-process.js'
        ];
        const sharedIgnoreFn = makeIgnoreFn(outputFileTracingRoot, sharedTraceIgnores);
        // The require hook redirects shared-runtime imports from external packages
        // to the Pages vendored contexts. Those contexts load module.compiled, whose
        // runtime dependency is selected dynamically. Turbopack includes this via
        // `Project::pages_traced_modules`; trace the Webpack runtime here.
        const pagesRuntimePath = require.resolve('next/dist/compiled/next-server/pages.runtime.prod.js');
        const pagesRuntimeTrace = await nodeFileTrace([
            pagesRuntimePath
        ], {
            base: outputFileTracingRoot,
            ignore: sharedIgnoreFn,
            moduleSyncCatchall: true
        });
        pagesRuntimeTrace.esmFileList.forEach((item)=>pagesRuntimeTrace.fileList.add(item));
        for (const tracingRootRelativeFilePath of pagesRuntimeTrace.fileList){
            const absoluteFilePath = _path.default.join(outputFileTracingRoot, tracingRootRelativeFilePath);
            await pushAsset(pagesSharedNodeAssets, pagesSharedNodeAssetsHashes, _path.default.relative(repoRoot, absoluteFilePath), absoluteFilePath, bundler, salt);
        }
        // These are modules that are necessary for bootstrapping node env
        const necessaryNodeDependencies = [
            require.resolve('next/dist/server/node-environment'),
            require.resolve('next/dist/server/require-hook'),
            require.resolve('next/dist/server/node-polyfill-crypto'),
            // Nothing references these, the require hook resolves them at runtime.
            // Turbopack traces them via `Project::pages_traced_modules`.
            ...Object.values(_requirehook.defaultOverrides).filter((item)=>_path.default.extname(item))
        ];
        const { cacheHandler, cacheHandlers } = config;
        // ensure we trace any dependencies needed for a custom incremental cache handler
        if (cacheHandler) {
            const resolvedPath = (0, _formatdynamicimportpath.resolveCacheHandlerPathToFilesystem)(cacheHandler);
            necessaryNodeDependencies.push(require.resolve(_path.default.isAbsolute(resolvedPath) ? resolvedPath : _path.default.join(dir, resolvedPath)));
        }
        if (cacheHandlers) {
            for (const handlerPath of Object.values(cacheHandlers)){
                if (handlerPath) {
                    const resolvedPath = (0, _formatdynamicimportpath.resolveCacheHandlerPathToFilesystem)(handlerPath);
                    necessaryNodeDependencies.push(require.resolve(_path.default.isAbsolute(resolvedPath) ? resolvedPath : _path.default.join(dir, resolvedPath)));
                }
            }
        }
        const { fileList, esmFileList } = await nodeFileTrace(necessaryNodeDependencies, {
            base: outputFileTracingRoot,
            ignore: sharedIgnoreFn,
            moduleSyncCatchall: true
        });
        esmFileList.forEach((item)=>fileList.add(item));
        for (const tracingRootRelativeFilePath of fileList){
            // nodeFileTrace returns paths relative to `base` (outputFileTracingRoot),
            // so resolve to an absolute path and re-relativize against repoRoot, which
            // is the root all adapter output keys/source paths are based on.
            const absoluteFilePath = _path.default.join(outputFileTracingRoot, tracingRootRelativeFilePath);
            await pushAsset(sharedNodeAssets, sharedNodeAssetsHashes, _path.default.relative(repoRoot, absoluteFilePath), absoluteFilePath, bundler, salt);
        }
    }
    if (hasInstrumentationHook) {
        const { entryHash: instrumentationEntryHash } = await loadNFT(sharedNodeAssets, sharedNodeAssetsHashes, repoRoot, _path.default.join(distDir, 'server', 'instrumentation.js.nft.json'), syntheticSymlinks, salt);
        const fileOutputPath = _path.default.relative(repoRoot, _path.default.join(distDir, 'server', 'instrumentation.js'));
        await pushAsset(sharedNodeAssets, sharedNodeAssetsHashes, fileOutputPath, _path.default.join(distDir, 'server', 'instrumentation.js'), bundler, salt, instrumentationEntryHash);
    }
    // Run after hasInstrumentationHook, which inserts the NFT-provided file hash for .next/server/instrumentation.js
    for (const file of requiredServerFiles){
        // add to shared node assets
        const filePath = _path.default.join(dir, file);
        const fileOutputPath = _path.default.relative(repoRoot, filePath);
        await pushAsset(sharedNodeAssets, sharedNodeAssetsHashes, fileOutputPath, filePath, bundler, salt);
    }
    return {
        sharedNodeAssets,
        sharedNodeAssetsHashes,
        pagesSharedNodeAssets,
        pagesSharedNodeAssetsHashes,
        appPagesSharedNodeAssets,
        appPagesSharedNodeAssetsHashes
    };
}
async function pushAsset(assets, assetsHashes, targetFilePath, sourceFilePath, bundler, salt, hashOverride) {
    if (!(targetFilePath in assets)) {
        assets[targetFilePath] = sourceFilePath;
        if (bundler === _bundler.Bundler.Turbopack) {
            assetsHashes[targetFilePath] = hashOverride ?? await hashFile(salt, sourceFilePath);
        }
    }
}
async function loadNFT(assets, assetsHashes, repoRoot, traceFilePath, syntheticSymlinks, salt) {
    const nft = JSON.parse(await _promises.default.readFile(traceFilePath, 'utf8'));
    for (const entry of (0, _nft.mapNftFileEntries)(nft, traceFilePath, repoRoot)){
        let source = entry.source;
        let hash = entry.hash;
        if (entry.symlinkCrossesRoot) {
            if (entry.symlinkTarget === undefined) {
                throw new _invarianterror.InvariantError(`Expected cross-root symlink ${JSON.stringify(entry.destination)} to have a target`);
            }
            const linkTarget = _path.default.relative(_path.default.dirname(entry.destination), entry.symlinkTarget) || '.';
            hash = hashLinkTarget(salt, linkTarget);
            source = syntheticSymlinks.createLink(entry.source, linkTarget, hash);
        }
        assets[entry.destination] = source;
        if (hash) {
            assetsHashes[entry.destination] = hash;
        }
    }
    return {
        entryHash: nft.entryHash
    };
}
async function hashFile(salt, filePath) {
    try {
        // Try symlink first, since readFile just transparently resolves those (or fails if it's a
        // directory symlink).
        const linkTarget = await _promises.default.readlink(filePath);
        return hashLinkTarget(salt, linkTarget);
    } catch (e) {
        if (e.code === 'EINVAL') {
            // Not a symlink
            const hash = _crypto.default.createHash('sha256');
            hash.update(salt);
            hash.update('file:');
            hash.update(await _promises.default.readFile(filePath));
            return hash.digest('hex');
        } else {
            throw e;
        }
    }
}
function hashLinkTarget(salt, linkTarget) {
    const hash = _crypto.default.createHash('sha256');
    hash.update(salt);
    hash.update('link');
    hash.update(linkTarget);
    return hash.digest('hex');
}

//# sourceMappingURL=build-complete.js.map