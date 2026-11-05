import path from 'path';
import fs from 'fs/promises';
import * as Log from '../../../build/output/log';
import setupDebug from 'next/dist/compiled/debug';
import { LRUCache } from '../lru-cache';
import loadCustomRoutes from '../../../lib/load-custom-routes';
import { modifyRouteRegex } from '../../../lib/redirect-status';
import { isAPIRoute } from '../../../lib/is-api-route';
import { isAppPageRoute } from '../../../lib/is-app-page-route';
import { isAppRouteRoute } from '../../../lib/is-app-route-route';
import { FileType, fileExists } from '../../../lib/file-exists';
import { recursiveReadDir } from '../../../lib/recursive-readdir';
import { addLocalePrefixToDataRouteRegex } from './build-data-route';
import { getSortedRoutes, isDynamicRoute } from '../../../shared/lib/router/utils';
import { getPathMatch } from '../../../shared/lib/router/utils/path-match';
import { getNamedRouteRegex, getRouteRegex } from '../../../shared/lib/router/utils/route-regex';
import { getRouteMatcher } from '../../../shared/lib/router/utils/route-matcher';
import { pathHasPrefix } from '../../../shared/lib/router/utils/path-has-prefix';
import { normalizeLocalePath } from '../../../shared/lib/i18n/normalize-locale-path';
import { removePathPrefix } from '../../../shared/lib/router/utils/remove-path-prefix';
import { getMiddlewareRouteMatcher } from '../../../shared/lib/router/utils/middleware-route-matcher';
import { PageNotFoundError } from '../../../shared/lib/utils';
import { APP_PATH_ROUTES_MANIFEST, APP_PATHS_MANIFEST, BLOCKED_PAGES, BUILD_ID_FILE, FUNCTIONS_CONFIG_MANIFEST, MIDDLEWARE_MANIFEST, PAGES_MANIFEST, PREVIEW_PROPS_MANIFEST, ROUTES_MANIFEST } from '../../../shared/lib/constants';
import { normalizePathSep } from '../../../shared/lib/page-path/normalize-path-sep';
import { normalizeMetadataRoute } from '../../../lib/metadata/get-metadata-route';
import { RSCPathnameNormalizer } from '../../normalizers/request/rsc';
import { encodeURIPath } from '../../../shared/lib/encode-uri-path';
import { isMetadataRouteFile } from '../../../lib/metadata/is-metadata-route';
import { PagesNormalizers } from '../../normalizers/built/pages';
import { AppNormalizers } from '../../normalizers/built/app';
import { RouteKind } from '../../route-kind';
import { isAppPageRouteDefinition } from '../../route-definitions/app-page-route-definition';
import { selectAppPageEntry } from '../../../shared/lib/router/utils/app-paths';
import { normalizeCatchAllRoutes } from './normalize-catchall-routes';
const debug = setupDebug('next:router-server:filesystem');
const buildFilesystemDynamicRoute = (page)=>{
    const routeRegex = getNamedRouteRegex(page, {
        prefixRouteKeys: true,
        includePrefix: true,
        includeSuffix: true
    });
    return {
        regex: routeRegex.re.toString(),
        namedRegex: routeRegex.namedRegex,
        routeKeys: routeRegex.routeKeys,
        match: getRouteMatcher(routeRegex),
        page
    };
};
const sortDynamicRoutes = (routes)=>{
    const references = new Map();
    const pages = [];
    for (const route of routes){
        const existing = references.get(route.page);
        if (existing) {
            existing.push(route);
        } else {
            references.set(route.page, [
                route
            ]);
            pages.push(route.page);
        }
    }
    return getSortedRoutes(pages).flatMap((page)=>references.get(page));
};
export const buildCustomRoute = (type, item, basePath, caseSensitive)=>{
    const restrictedRedirectPaths = [
        '/_next'
    ].map((p)=>basePath ? `${basePath}${p}` : p);
    let builtRegex = '';
    const match = getPathMatch(item.source, {
        strict: true,
        removeUnnamedParams: true,
        regexModifier: (regex)=>{
            if (!item.internal) {
                regex = modifyRouteRegex(regex, type === 'redirect' ? restrictedRedirectPaths : undefined);
            }
            builtRegex = regex;
            return builtRegex;
        },
        sensitive: caseSensitive
    });
    return {
        ...item,
        regex: builtRegex,
        ...type === 'rewrite' ? {
            check: true
        } : {},
        match
    };
};
// Measured retained cost of a cache entry beyond its strings (LRUNode,
// Map slot, string header): ~120 bytes. Counting it keeps the entry count
// bounded even when keys are short, so the budget approximates retained
// bytes.
const FS_LRU_ENTRY_OVERHEAD = 128;
const FS_LRU_MAX_SIZE = 8 * 1024 * 1024;
// The pathname passed to getItem is usually a V8 slice of the full request
// URL, and a sliced string retains its parent — including the query string —
// for as long as the cache holds the key. Store a flat copy instead.
// The JSON round-trip returns an equal string for every input (unlike a
// Buffer round-trip, which replaces lone surrogates), so distinct keys can
// never collide on the stored copy.
function flatKeyCopy(key) {
    return JSON.parse(JSON.stringify(key));
}
// Cached result for paths that resolve to nothing. Not null, so that a
// cached miss can't be conflated with an uncached key (undefined).
const notFound = Symbol('not-found');
export async function setupFsCheck(opts) {
    const getItemsLru = !opts.dev ? new LRUCache(FS_LRU_MAX_SIZE, function length(value, key) {
        const size = FS_LRU_ENTRY_OVERHEAD + key.length;
        if (value === notFound) {
            // Negative cache entries only retain their key.
            return size;
        }
        return size + (value.fsPath || '').length + value.itemPath.length + value.type.length;
    }) : undefined;
    // routes that have _next/data endpoints (SSG/SSP)
    const nextDataRoutes = new Set();
    const publicFolderItems = new Set();
    const nextStaticFolderItems = new Set();
    const legacyStaticFolderItems = new Set();
    const appFiles = new Set();
    const pageFiles = new Set();
    // Map normalized path to the file path. This is essential
    // for parallel and group routes as their original path
    // cannot be restored from the request path.
    // Example:
    // [normalized-path] -> [file-path]
    // /icon-<hash>.png -> .../app/@parallel/icon.png
    // /icon-<hash>.png -> .../app/(group)/icon.png
    // /icon.png -> .../app/icon.png
    const staticMetadataFiles = new Map();
    let dynamicRoutes = [];
    // Page and app outputs need route metadata for compilation and rendering.
    // Static assets remain plain filesystem matches.
    const routeDefinitions = {
        appFile: new Map(),
        pageFile: new Map()
    };
    let middlewareMatcher = ()=>false;
    const distDir = path.join(opts.dir, opts.config.distDir);
    const publicFolderPath = path.join(opts.dir, 'public');
    const nextStaticFolderPath = path.join(distDir, 'static');
    const legacyStaticFolderPath = path.join(opts.dir, 'static');
    let customRoutes = {
        redirects: [],
        rewrites: {
            beforeFiles: [],
            afterFiles: [],
            fallback: []
        },
        onMatchHeaders: [],
        headers: []
    };
    let buildId = 'development';
    let previewProps;
    const setRouteDefinition = (type, pathname, definition)=>{
        const definitions = routeDefinitions[type].get(pathname);
        if (definitions) {
            definitions.push(definition);
        } else {
            routeDefinitions[type].set(pathname, [
                definition
            ]);
        }
    };
    const getRouteDefinition = (type, itemPath, locale)=>{
        const definitions = routeDefinitions[type].get(itemPath);
        if (!(definitions == null ? void 0 : definitions.length)) return undefined;
        if (type === 'pageFile') {
            return definitions.find((definition)=>{
                var _definition_i18n;
                return ((_definition_i18n = definition.i18n) == null ? void 0 : _definition_i18n.locale) === locale;
            }) ?? definitions.find((definition)=>{
                var _definition_i18n;
                return !((_definition_i18n = definition.i18n) == null ? void 0 : _definition_i18n.locale);
            }) ?? definitions[0];
        }
        return definitions[0];
    };
    const pagesNormalizers = new PagesNormalizers(distDir);
    const appNormalizers = new AppNormalizers(distDir);
    if (!opts.dev) {
        var _middlewareManifest_middleware_, _middlewareManifest_middleware;
        const buildIdPath = path.join(opts.dir, opts.config.distDir, BUILD_ID_FILE);
        try {
            buildId = await fs.readFile(buildIdPath, 'utf8');
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
            throw new Error(`Could not find a production build in the '${opts.config.distDir}' directory. Try building your app with 'next build' before starting the production server. https://nextjs.org/docs/messages/production-start-no-build-id`);
        }
        try {
            for (const file of (await recursiveReadDir(publicFolderPath))){
                // Ensure filename is encoded and normalized.
                publicFolderItems.add(encodeURIPath(normalizePathSep(file)));
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        try {
            for (const file of (await recursiveReadDir(legacyStaticFolderPath))){
                // Ensure filename is encoded and normalized.
                legacyStaticFolderItems.add(encodeURIPath(normalizePathSep(file)));
            }
            Log.warn(`The static directory has been deprecated in favor of the public directory. https://nextjs.org/docs/messages/static-dir-deprecated`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        try {
            for (const file of (await recursiveReadDir(nextStaticFolderPath))){
                // Ensure filename is encoded and normalized.
                nextStaticFolderItems.add(path.posix.join('/_next/static', encodeURIPath(normalizePathSep(file))));
            }
        } catch (err) {
            if (opts.config.output !== 'standalone') throw err;
        }
        const routesManifestPath = path.join(distDir, ROUTES_MANIFEST);
        const previewPropsManifestPath = path.join(distDir, 'server', PREVIEW_PROPS_MANIFEST);
        const middlewareManifestPath = path.join(distDir, 'server', MIDDLEWARE_MANIFEST);
        const functionsConfigManifestPath = path.join(distDir, 'server', FUNCTIONS_CONFIG_MANIFEST);
        const pagesManifestPath = path.join(distDir, 'server', PAGES_MANIFEST);
        const appPathsManifestPath = path.join(distDir, 'server', APP_PATHS_MANIFEST);
        const appRoutesManifestPath = path.join(distDir, APP_PATH_ROUTES_MANIFEST);
        const routesManifest = JSON.parse(await fs.readFile(routesManifestPath, 'utf8'));
        previewProps = JSON.parse(await fs.readFile(previewPropsManifestPath, 'utf8'));
        const middlewareManifest = JSON.parse(await fs.readFile(middlewareManifestPath, 'utf8').catch(()=>'{}'));
        const functionsConfigManifest = JSON.parse(await fs.readFile(functionsConfigManifestPath, 'utf8').catch(()=>'{}'));
        const pagesManifest = JSON.parse(await fs.readFile(pagesManifestPath, 'utf8'));
        const appPathsManifest = JSON.parse(await fs.readFile(appPathsManifestPath, 'utf8').catch(()=>'{}'));
        const appRoutesManifest = JSON.parse(await fs.readFile(appRoutesManifestPath, 'utf8').catch(()=>'{}'));
        const appDynamicRoutes = [];
        const appDynamicRoutePathnames = new Set();
        const addAppDynamicRoute = (pathname)=>{
            if (!isDynamicRoute(pathname) || appDynamicRoutePathnames.has(pathname)) {
                return;
            }
            appDynamicRoutePathnames.add(pathname);
            appDynamicRoutes.push(buildFilesystemDynamicRoute(pathname));
        };
        for (const key of Object.keys(pagesManifest)){
            const localeResult = opts.config.i18n ? normalizeLocalePath(key, opts.config.i18n.locales) : {
                pathname: key,
                detectedLocale: undefined
            };
            // ensure the non-locale version is in the set
            if (opts.config.i18n) {
                pageFiles.add(localeResult.pathname);
            } else {
                pageFiles.add(key);
            }
            if (!isAPIRoute(key) && BLOCKED_PAGES.includes(localeResult.pathname)) {
                continue;
            }
            setRouteDefinition('pageFile', localeResult.pathname, {
                kind: isAPIRoute(key) ? RouteKind.PAGES_API : RouteKind.PAGES,
                pathname: localeResult.pathname,
                page: key,
                bundlePath: pagesNormalizers.bundlePath.normalize(key),
                filename: pagesNormalizers.filename.normalize(pagesManifest[key]),
                ...opts.config.i18n ? {
                    i18n: {
                        locale: localeResult.detectedLocale
                    }
                } : undefined
            });
        }
        for (const key of Object.keys(appRoutesManifest)){
            appFiles.add(appRoutesManifest[key]);
        }
        const appPages = Object.keys(appPathsManifest).filter((page)=>isAppPageRoute(page));
        const allAppPaths = {};
        for (const page of appPages){
            const pathname = appNormalizers.pathname.normalize(page);
            if (pathname in allAppPaths) allAppPaths[pathname].push(page);
            else allAppPaths[pathname] = [
                page
            ];
        }
        normalizeCatchAllRoutes(allAppPaths, appNormalizers.pathname);
        for (const [pathname, appPaths] of Object.entries(allAppPaths)){
            // Keep manifest order aligned with the module packaged for this route.
            const page = selectAppPageEntry(pathname, appPaths, (appPath)=>appNormalizers.pathname.normalize(appPath));
            setRouteDefinition('appFile', pathname, {
                kind: RouteKind.APP_PAGE,
                pathname,
                page,
                bundlePath: appNormalizers.bundlePath.normalize(page),
                filename: appNormalizers.filename.normalize(appPathsManifest[page]),
                appPaths
            });
            addAppDynamicRoute(pathname);
        }
        const appRouteHandlers = Object.keys(appPathsManifest).filter((page)=>isAppRouteRoute(page));
        for (const page of appRouteHandlers){
            const pathname = appNormalizers.pathname.normalize(page);
            setRouteDefinition('appFile', pathname, {
                kind: RouteKind.APP_ROUTE,
                pathname,
                page,
                bundlePath: appNormalizers.bundlePath.normalize(page),
                filename: appNormalizers.filename.normalize(appPathsManifest[page])
            });
            addAppDynamicRoute(pathname);
        }
        for (const route of routesManifest.dataRoutes){
            if (isDynamicRoute(route.page)) {
                const routeRegex = getNamedRouteRegex(route.page, {
                    prefixRouteKeys: true
                });
                dynamicRoutes.push({
                    ...route,
                    regex: routeRegex.re.toString(),
                    namedRegex: routeRegex.namedRegex,
                    routeKeys: routeRegex.routeKeys,
                    match: getRouteMatcher({
                        // TODO: fix this in the manifest itself, must also be fixed in
                        // upstream builder that relies on this
                        re: opts.config.i18n ? new RegExp(addLocalePrefixToDataRouteRegex(route.dataRouteRegex, buildId)) : new RegExp(route.dataRouteRegex),
                        groups: routeRegex.groups
                    })
                });
            }
            nextDataRoutes.add(route.page);
        }
        const filesystemDynamicRoutes = [
            ...appDynamicRoutes
        ];
        for (const route of routesManifest.dynamicRoutes){
            // If a route is marked as skipInternalRouting, it's not for the internal
            // router, and instead has been added to support external routers.
            if (route.skipInternalRouting) {
                continue;
            }
            filesystemDynamicRoutes.push({
                ...route,
                ...buildFilesystemDynamicRoute(route.page)
            });
        }
        dynamicRoutes.push(...sortDynamicRoutes(filesystemDynamicRoutes));
        if ((_middlewareManifest_middleware = middlewareManifest.middleware) == null ? void 0 : (_middlewareManifest_middleware_ = _middlewareManifest_middleware['/']) == null ? void 0 : _middlewareManifest_middleware_.matchers) {
            var _middlewareManifest_middleware_1, _middlewareManifest_middleware1;
            middlewareMatcher = getMiddlewareRouteMatcher((_middlewareManifest_middleware1 = middlewareManifest.middleware) == null ? void 0 : (_middlewareManifest_middleware_1 = _middlewareManifest_middleware1['/']) == null ? void 0 : _middlewareManifest_middleware_1.matchers);
        } else if (functionsConfigManifest == null ? void 0 : functionsConfigManifest.functions['/_middleware']) {
            middlewareMatcher = getMiddlewareRouteMatcher(functionsConfigManifest.functions['/_middleware'].matchers ?? [
                {
                    regexp: '.*',
                    originalSource: '/:path*'
                }
            ]);
        }
        customRoutes = {
            redirects: routesManifest.redirects,
            rewrites: routesManifest.rewrites ? Array.isArray(routesManifest.rewrites) ? {
                beforeFiles: [],
                afterFiles: routesManifest.rewrites,
                fallback: []
            } : routesManifest.rewrites : {
                beforeFiles: [],
                afterFiles: [],
                fallback: []
            },
            headers: routesManifest.headers,
            onMatchHeaders: routesManifest.onMatchHeaders
        };
    } else {
        // dev handling
        customRoutes = await loadCustomRoutes(opts.config);
        previewProps = {
            previewModeId: require('crypto').randomBytes(16).toString('hex'),
            previewModeSigningKey: require('crypto').randomBytes(32).toString('hex'),
            previewModeEncryptionKey: require('crypto').randomBytes(32).toString('hex')
        };
    }
    const headers = customRoutes.headers.map((item)=>buildCustomRoute('header', item, opts.config.basePath, opts.config.experimental.caseSensitiveRoutes));
    const onMatchHeaders = customRoutes.onMatchHeaders.map((item)=>buildCustomRoute('header', item, opts.config.basePath, opts.config.experimental.caseSensitiveRoutes));
    const redirects = customRoutes.redirects.map((item)=>buildCustomRoute('redirect', item, opts.config.basePath, opts.config.experimental.caseSensitiveRoutes));
    const rewrites = {
        beforeFiles: customRoutes.rewrites.beforeFiles.map((item)=>buildCustomRoute('before_files_rewrite', item)),
        afterFiles: customRoutes.rewrites.afterFiles.map((item)=>buildCustomRoute('rewrite', item, opts.config.basePath, opts.config.experimental.caseSensitiveRoutes)),
        fallback: customRoutes.rewrites.fallback.map((item)=>buildCustomRoute('rewrite', item, opts.config.basePath, opts.config.experimental.caseSensitiveRoutes))
    };
    const { i18n } = opts.config;
    const handleLocale = (pathname, locales)=>{
        let locale;
        if (i18n) {
            const i18nResult = normalizeLocalePath(pathname, locales || i18n.locales);
            pathname = i18nResult.pathname;
            locale = i18nResult.detectedLocale;
        }
        return {
            locale,
            pathname
        };
    };
    debug('nextDataRoutes', nextDataRoutes);
    debug('dynamicRoutes', dynamicRoutes);
    debug('customRoutes', customRoutes);
    debug('publicFolderItems', publicFolderItems);
    debug('nextStaticFolderItems', nextStaticFolderItems);
    debug('pageFiles', pageFiles);
    debug('appFiles', appFiles);
    let ensureFn;
    const normalizers = {
        // Because we can't know if the app directory is enabled or not at this
        // stage, we assume that it is.
        rsc: new RSCPathnameNormalizer()
    };
    return {
        headers,
        onMatchHeaders,
        rewrites,
        redirects,
        buildId,
        handleLocale,
        appFiles,
        pageFiles,
        staticMetadataFiles,
        dynamicRoutes,
        nextDataRoutes,
        setRouteDefinitions (type, definitions) {
            routeDefinitions[type].clear();
            for (const definition of definitions){
                setRouteDefinition(type, definition.pathname, definition);
            }
        },
        getRouteDefinition,
        exportPathMapRoutes: undefined,
        devVirtualFsItems: new Set(),
        previewProps,
        middlewareMatcher: middlewareMatcher,
        ensureCallback (fn) {
            ensureFn = fn;
        },
        async getItem (itemPath, requestPath) {
            const originalItemPath = itemPath;
            const itemKey = originalItemPath;
            const lruResult = getItemsLru == null ? void 0 : getItemsLru.get(itemKey);
            if (lruResult !== undefined) {
                return lruResult === notFound ? null : lruResult;
            }
            const { basePath } = opts.config;
            const hasBasePath = pathHasPrefix(itemPath, basePath);
            // Return null if path doesn't start with basePath
            if (basePath && !hasBasePath) {
                return null;
            }
            // Remove basePath if it exists.
            if (basePath && hasBasePath) {
                itemPath = removePathPrefix(itemPath, basePath) || '/';
            }
            // Simulate minimal mode requests by normalizing RSC and postponed
            // requests.
            if (opts.minimalMode) {
                if (normalizers.rsc.match(itemPath)) {
                    itemPath = normalizers.rsc.normalize(itemPath, true);
                }
            }
            if (itemPath !== '/' && itemPath.endsWith('/')) {
                itemPath = itemPath.substring(0, itemPath.length - 1);
            }
            let decodedItemPath = itemPath;
            try {
                decodedItemPath = decodeURIComponent(itemPath);
            } catch  {}
            if (itemPath === '/_next/image') {
                return {
                    itemPath,
                    type: 'nextImage'
                };
            }
            if (opts.dev && isMetadataRouteFile(itemPath, [], false)) {
                const fsPath = staticMetadataFiles.get(itemPath);
                if (fsPath) {
                    return {
                        // "nextStaticFolder" sets Cache-Control
                        // "no-cache, must-revalidate" on dev.
                        type: 'nextStaticFolder',
                        fsPath,
                        itemPath: fsPath
                    };
                }
            }
            const itemsToCheck = [
                [
                    this.devVirtualFsItems,
                    'devVirtualFsItem'
                ],
                [
                    nextStaticFolderItems,
                    'nextStaticFolder'
                ],
                [
                    legacyStaticFolderItems,
                    'legacyStaticFolder'
                ],
                [
                    publicFolderItems,
                    'publicFolder'
                ],
                [
                    appFiles,
                    'appFile'
                ],
                [
                    pageFiles,
                    'pageFile'
                ]
            ];
            for (let [items, type] of itemsToCheck){
                let locale;
                let curItemPath = itemPath;
                let curDecodedItemPath = decodedItemPath;
                const isPageOrAppFile = type === 'pageFile' || type === 'appFile';
                if (i18n) {
                    var _i18n_domains;
                    const localeResult = handleLocale(itemPath, // legacy behavior allows visiting static assets under
                    // default locale but no other locale
                    isPageOrAppFile ? undefined : [
                        i18n == null ? void 0 : i18n.defaultLocale,
                        // default locales from domains need to be matched too
                        ...((_i18n_domains = i18n.domains) == null ? void 0 : _i18n_domains.map((item)=>item.defaultLocale)) || []
                    ]);
                    if (localeResult.pathname !== curItemPath) {
                        curItemPath = localeResult.pathname;
                        locale = localeResult.locale;
                        try {
                            curDecodedItemPath = decodeURIComponent(curItemPath);
                        } catch  {}
                    }
                }
                if (type === 'legacyStaticFolder') {
                    if (!pathHasPrefix(curItemPath, '/static')) {
                        continue;
                    }
                    curItemPath = curItemPath.substring('/static'.length);
                    try {
                        curDecodedItemPath = decodeURIComponent(curItemPath);
                    } catch  {}
                }
                if (type === 'nextStaticFolder' && !pathHasPrefix(curItemPath, '/_next/static')) {
                    continue;
                }
                const nextDataPrefix = `/_next/data/${buildId}/`;
                if (type === 'pageFile' && curItemPath.startsWith(nextDataPrefix) && curItemPath.endsWith('.json')) {
                    items = nextDataRoutes;
                    // remove _next/data/<build-id> prefix
                    curItemPath = curItemPath.substring(nextDataPrefix.length - 1);
                    // remove .json postfix
                    curItemPath = curItemPath.substring(0, curItemPath.length - '.json'.length);
                    const curLocaleResult = handleLocale(curItemPath);
                    curItemPath = curLocaleResult.pathname === '/index' ? '/' : curLocaleResult.pathname;
                    locale = curLocaleResult.locale;
                    try {
                        curDecodedItemPath = decodeURIComponent(curItemPath);
                    } catch  {}
                }
                // Only page and app outputs participate in route rendering. Public,
                // static, image, and virtual outputs are served as filesystem assets.
                const route = isPageOrAppFile ? getRouteDefinition(type, curItemPath, locale) : undefined;
                let matchedItem = items.has(curItemPath);
                // check decoded variant as well
                if (!matchedItem && !opts.dev) {
                    matchedItem = items.has(curDecodedItemPath);
                    if (matchedItem) curItemPath = curDecodedItemPath;
                    else {
                        // x-ref: https://github.com/vercel/next.js/issues/54008
                        // There're cases that urls get decoded before requests, we should support both encoded and decoded ones.
                        // e.g. nginx could decode the proxy urls, the below ones should be treated as the same:
                        // decoded version: `/_next/static/chunks/pages/blog/[slug]-d4858831b91b69f6.js`
                        // encoded version: `/_next/static/chunks/pages/blog/%5Bslug%5D-d4858831b91b69f6.js`
                        try {
                            // encode the special characters in the path and retrieve again to determine if path exists.
                            const encodedCurItemPath = encodeURIPath(curItemPath);
                            matchedItem = items.has(encodedCurItemPath);
                        } catch  {}
                    }
                }
                if (matchedItem || opts.dev) {
                    let fsPath;
                    let itemsRoot;
                    switch(type){
                        case 'nextStaticFolder':
                            {
                                itemsRoot = nextStaticFolderPath;
                                curItemPath = curItemPath.substring('/_next/static'.length);
                                break;
                            }
                        case 'legacyStaticFolder':
                            {
                                itemsRoot = legacyStaticFolderPath;
                                break;
                            }
                        case 'publicFolder':
                            {
                                itemsRoot = publicFolderPath;
                                break;
                            }
                        case 'appFile':
                        case 'pageFile':
                        case 'nextImage':
                        case 'devVirtualFsItem':
                            {
                                break;
                            }
                        default:
                            {
                                ;
                                type;
                            }
                    }
                    if (itemsRoot && curItemPath) {
                        fsPath = path.posix.join(itemsRoot, curItemPath);
                    }
                    // dynamically check fs in development so we don't
                    // have to wait on the watcher
                    if (!matchedItem && opts.dev) {
                        const isStaticAsset = [
                            'nextStaticFolder',
                            'publicFolder',
                            'legacyStaticFolder'
                        ].includes(type);
                        if (isStaticAsset && itemsRoot) {
                            let found = fsPath && await fileExists(fsPath, FileType.File);
                            if (!found) {
                                try {
                                    // In dev, we ensure encoded paths match
                                    // decoded paths on the filesystem so check
                                    // that variation as well
                                    const tempItemPath = decodeURIComponent(curItemPath);
                                    fsPath = path.posix.join(itemsRoot, tempItemPath);
                                    found = await fileExists(fsPath, FileType.File);
                                } catch  {}
                                if (!found) {
                                    continue;
                                }
                            }
                        } else if (!isPageOrAppFile) {
                            continue;
                        }
                    }
                    let error;
                    if (opts.dev && isPageOrAppFile) {
                        if (!route) {
                            continue;
                        }
                        const isAppFile = type === 'appFile';
                        // Attempt to ensure the page/app file is compiled and ready.
                        if (ensureFn) {
                            const ensureItemPath = isAppFile ? normalizeMetadataRoute(curItemPath) : curItemPath;
                            try {
                                await ensureFn({
                                    type,
                                    itemPath: ensureItemPath,
                                    route,
                                    requestPath
                                });
                            } catch (err) {
                                // A disappeared route is not a match. Compilation errors still
                                // belong to this route and must render as a 500 downstream.
                                if (err instanceof PageNotFoundError) {
                                    continue;
                                }
                                error = err instanceof Error ? err : new Error(String(err));
                            }
                        }
                    }
                    // i18n locales aren't matched for app dir
                    if (type === 'appFile' && locale && locale !== (i18n == null ? void 0 : i18n.defaultLocale)) {
                        continue;
                    }
                    if (isPageOrAppFile && !route && !matchedItem) {
                        continue;
                    }
                    let params;
                    if (route && isAppPageRouteDefinition(route)) {
                        // Parallel app routes can contribute multiple dynamic app paths
                        // to one pathname. Preserve the params from the matching path.
                        for (const appPath of route.appPaths){
                            const routePathname = appNormalizers.pathname.normalize(appPath);
                            if (!isDynamicRoute(routePathname)) {
                                continue;
                            }
                            const routeParams = getRouteMatcher(getRouteRegex(routePathname))(curItemPath);
                            if (routeParams) {
                                params = routeParams;
                                break;
                            }
                        }
                    }
                    const itemResult = {
                        type,
                        fsPath,
                        locale,
                        itemsRoot,
                        // itemPath is usually a slice of the request URL too; keep a
                        // flat copy so the cached value doesn't retain the full URL.
                        itemPath: flatKeyCopy(curItemPath),
                        route,
                        params,
                        error
                    };
                    getItemsLru == null ? void 0 : getItemsLru.set(flatKeyCopy(itemKey), itemResult);
                    return itemResult;
                }
            }
            getItemsLru == null ? void 0 : getItemsLru.set(flatKeyCopy(itemKey), notFound);
            return null;
        },
        getDynamicRoutes () {
            // this should include data routes
            return this.dynamicRoutes;
        },
        getMiddlewareMatchers () {
            return this.middlewareMatcher;
        }
    };
}

//# sourceMappingURL=filesystem.js.map