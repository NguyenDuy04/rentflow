import '../../build/adapter/setup-node-env.external';
import { BUILD_ID_FILE, BUILD_MANIFEST, CLIENT_REFERENCE_MANIFEST, DYNAMIC_CSS_MANIFEST, NEXT_FONT_MANIFEST, PREFETCH_HINTS, PRERENDER_MANIFEST, PREVIEW_PROPS_MANIFEST, REACT_LOADABLE_MANIFEST, ROUTES_MANIFEST, SERVER_FILES_MANIFEST, SERVER_REFERENCE_MANIFEST, SUBRESOURCE_INTEGRITY_MANIFEST } from '../../shared/lib/constants';
import { parseReqUrl } from '../../lib/url';
import { normalizeLocalePath } from '../../shared/lib/i18n/normalize-locale-path';
import { isDynamicRoute } from '../../shared/lib/router/utils';
import { removePathPrefix } from '../../shared/lib/router/utils/remove-path-prefix';
import { getServerUtils } from '../server-utils';
import { detectDomainLocale } from '../../shared/lib/i18n/detect-domain-locale';
import { getHostname } from '../../shared/lib/get-hostname';
import { checkIsOnDemandRevalidate } from '../api-utils';
import { normalizeDataPath } from '../../shared/lib/page-path/normalize-data-path';
import { pathHasPrefix } from '../../shared/lib/router/utils/path-has-prefix';
import { addRequestMeta, getRequestMeta } from '../request-meta';
import { patchSetHeaderWithCookieSupport } from '../lib/patch-set-header';
import { normalizePagePath } from '../../shared/lib/page-path/normalize-page-path';
import { isStaticMetadataRoute } from '../../lib/metadata/is-metadata-route';
import { IncrementalCache } from '../lib/incremental-cache';
import { initializeCacheHandlers, registerCustomCacheHandlers, setCacheHandler } from '../use-cache/handlers';
import { interopDefault } from '../app-render/interop-default';
import { RouteKind } from '../route-kind';
import { getResponseCacheOwner } from '../lib/route-cache-key';
import ResponseCache from '../response-cache';
import { normalizeAppPath } from '../../shared/lib/router/utils/app-paths';
import { RouterServerContextSymbol, routerServerGlobal } from '../lib/router-utils/router-server-context';
import { decodePathParams } from '../lib/router-utils/decode-path-params';
import { removeTrailingSlash } from '../../shared/lib/router/utils/remove-trailing-slash';
import { isInterceptionRouteRewrite } from '../../lib/is-interception-route-rewrite';
import { getTracer, SpanKind } from '../lib/trace/tracer';
import { BaseServerSpan, RouteModuleSpan } from '../lib/trace/constants';
const dynamicImportEsmDefault = (id)=>import(/* webpackIgnore: true */ /* turbopackIgnore: true */ id).then((mod)=>mod.default || mod);
/**
 * RouteModule is the base class for all route modules. This class should be
 * extended by all route modules.
 */ export class RouteModule {
    get userland() {
        return this._userland;
    }
    constructor({ userland, definition, distDir, relativeProjectDir }){
        this._userland = userland;
        this.definition = definition;
        this.cacheOwner = getResponseCacheOwner(definition);
        this.isDev = !!process.env.__NEXT_DEV_SERVER;
        this.distDir = distDir;
        this.relativeProjectDir = relativeProjectDir;
    }
    getRouterServerContext(req) {
        var _routerServerGlobal_RouterServerContextSymbol;
        const hostname = getRequestMeta(req, 'hostname');
        const revalidate = getRequestMeta(req, 'revalidate');
        const render404 = getRequestMeta(req, 'render404');
        const relativeProjectDir = getRequestMeta(req, 'relativeProjectDir') || this.relativeProjectDir;
        const routerServerContext = (_routerServerGlobal_RouterServerContextSymbol = routerServerGlobal[RouterServerContextSymbol]) == null ? void 0 : _routerServerGlobal_RouterServerContextSymbol[relativeProjectDir];
        return {
            ...routerServerContext,
            ...hostname !== undefined ? {
                hostname
            } : {},
            ...revalidate !== undefined ? {
                revalidate
            } : {},
            ...render404 !== undefined ? {
                render404
            } : {}
        };
    }
    getAssetPrefixForRender(routerServerContext, configuredAssetPrefix) {
        // A running NextServer owns overrides from app.setAssetPrefix().
        if (routerServerContext && routerServerContext.getAssetPrefix) {
            return routerServerContext.getAssetPrefix();
        }
        // Direct route invocations use the configured prefix.
        return configuredAssetPrefix;
    }
    normalizeUrl(_req, _parsedUrl) {}
    async instrumentationOnRequestError(req, ...args) {
        if (process.env.NEXT_RUNTIME === 'edge') {
            const { getEdgeInstrumentationModule } = await import('../web/globals');
            const instrumentation = await getEdgeInstrumentationModule();
            if (instrumentation) {
                await (instrumentation.onRequestError == null ? void 0 : instrumentation.onRequestError.call(instrumentation, ...args));
            }
        } else {
            const { join } = require('node:path');
            const absoluteProjectDir = join(/* turbopackIgnore: true */ process.cwd(), getRequestMeta(req, 'relativeProjectDir') || this.relativeProjectDir);
            const { instrumentationOnRequestError } = await import('../lib/router-utils/instrumentation-globals.external.js');
            return instrumentationOnRequestError(absoluteProjectDir, this.distDir, ...args);
        }
    }
    loadManifests(srcPage, projectDir) {
        let result;
        if (process.env.NEXT_RUNTIME === 'edge') {
            var _self___RSC_MANIFEST;
            const { getEdgePreviewProps } = require('../web/get-edge-preview-props');
            const maybeJSONParse = (str)=>str ? JSON.parse(str) : undefined;
            result = {
                buildId: process.env.__NEXT_BUILD_ID || '',
                buildManifest: self.__BUILD_MANIFEST,
                fallbackBuildManifest: {},
                reactLoadableManifest: maybeJSONParse(self.__REACT_LOADABLE_MANIFEST),
                nextFontManifest: maybeJSONParse(self.__NEXT_FONT_MANIFEST),
                prerenderManifest: {
                    routes: {},
                    dynamicRoutes: {},
                    notFoundRoutes: [],
                    version: 4,
                    preview: getEdgePreviewProps()
                },
                previewProps: getEdgePreviewProps(),
                routesManifest: {
                    version: 4,
                    caseSensitive: Boolean(process.env.__NEXT_CASE_SENSITIVE_ROUTES),
                    basePath: process.env.__NEXT_BASE_PATH || '',
                    rewrites: process.env.__NEXT_REWRITES || {
                        beforeFiles: [],
                        afterFiles: [],
                        fallback: []
                    },
                    redirects: [],
                    headers: [],
                    onMatchHeaders: [],
                    i18n: process.env.__NEXT_I18N_CONFIG || undefined,
                    skipProxyUrlNormalize: Boolean(process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE)
                },
                serverFilesManifest: self.__SERVER_FILES_MANIFEST,
                clientReferenceManifest: (_self___RSC_MANIFEST = self.__RSC_MANIFEST) == null ? void 0 : _self___RSC_MANIFEST[srcPage],
                serverActionsManifest: maybeJSONParse(self.__RSC_SERVER_MANIFEST),
                subresourceIntegrityManifest: maybeJSONParse(self.__SUBRESOURCE_INTEGRITY_MANIFEST),
                dynamicCssManifest: maybeJSONParse(self.__DYNAMIC_CSS_MANIFEST),
                // Edge pages are always dynamic so prefetch inlining hints
                // don't apply. The runtime handles missing hints gracefully.
                prefetchHintsManifest: undefined,
                interceptionRoutePatterns: (maybeJSONParse(self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST) ?? []).map((rewrite)=>new RegExp(rewrite.regex))
            };
        } else {
            var _clientReferenceManifest___RSC_MANIFEST;
            if (!projectDir) {
                throw new Error('Invariant: projectDir is required for node runtime');
            }
            const { loadManifestFromRelativePath, evalManifestFromRelativePath } = require('../load-manifest.external');
            const normalizedPagePath = normalizePagePath(srcPage);
            const router = this.definition.kind === RouteKind.PAGES || this.definition.kind === RouteKind.PAGES_API ? 'pages' : 'app';
            const [routesManifest, prerenderManifest, previewProps, buildManifest, fallbackBuildManifest, reactLoadableManifest, nextFontManifest, clientReferenceManifest, serverActionsManifest, subresourceIntegrityManifest, serverFilesManifest, buildId, dynamicCssManifest, prefetchHintsManifest] = [
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: ROUTES_MANIFEST,
                    shouldCache: !this.isDev
                }),
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: PRERENDER_MANIFEST,
                    shouldCache: !this.isDev
                }),
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: `server/${PREVIEW_PROPS_MANIFEST}`,
                    shouldCache: !this.isDev
                }),
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: BUILD_MANIFEST,
                    shouldCache: !this.isDev
                }),
                srcPage === '/_error' ? loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: `fallback-${BUILD_MANIFEST}`,
                    shouldCache: !this.isDev,
                    handleMissing: true
                }) ?? {} : {},
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: process.env.TURBOPACK ? `server/${router === 'app' ? 'app' : 'pages'}${normalizedPagePath}/${REACT_LOADABLE_MANIFEST}` : REACT_LOADABLE_MANIFEST,
                    handleMissing: true,
                    shouldCache: !this.isDev
                }) ?? {},
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: `server/${NEXT_FONT_MANIFEST}.json`,
                    shouldCache: !this.isDev
                }),
                router === 'app' && !isStaticMetadataRoute(srcPage) ? evalManifestFromRelativePath({
                    distDir: this.distDir,
                    projectDir,
                    handleMissing: true,
                    manifest: `server/app${srcPage.replace(/%5F/g, '_') + '_' + CLIENT_REFERENCE_MANIFEST}.js`,
                    shouldCache: !this.isDev
                }) : undefined,
                router === 'app' ? loadManifestFromRelativePath({
                    distDir: this.distDir,
                    projectDir,
                    manifest: `server/${SERVER_REFERENCE_MANIFEST}.json`,
                    handleMissing: true,
                    shouldCache: !this.isDev
                }) : {},
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: `server/${SUBRESOURCE_INTEGRITY_MANIFEST}.json`,
                    handleMissing: true,
                    shouldCache: !this.isDev
                }),
                this.isDev ? undefined : loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    shouldCache: true,
                    manifest: `${SERVER_FILES_MANIFEST}.json`
                }),
                this.isDev ? 'development' : loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: BUILD_ID_FILE,
                    skipParse: true,
                    shouldCache: true
                }),
                loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: DYNAMIC_CSS_MANIFEST,
                    shouldCache: !this.isDev,
                    handleMissing: true
                }),
                router === 'app' ? loadManifestFromRelativePath({
                    projectDir,
                    distDir: this.distDir,
                    manifest: `server/${PREFETCH_HINTS}`,
                    shouldCache: !this.isDev,
                    handleMissing: true
                }) : undefined
            ];
            result = {
                buildId,
                buildManifest,
                fallbackBuildManifest,
                routesManifest,
                nextFontManifest,
                prerenderManifest,
                previewProps,
                serverFilesManifest,
                reactLoadableManifest,
                clientReferenceManifest: clientReferenceManifest == null ? void 0 : (_clientReferenceManifest___RSC_MANIFEST = clientReferenceManifest.__RSC_MANIFEST) == null ? void 0 : _clientReferenceManifest___RSC_MANIFEST[srcPage.replace(/%5F/g, '_')],
                serverActionsManifest,
                subresourceIntegrityManifest,
                dynamicCssManifest,
                prefetchHintsManifest,
                interceptionRoutePatterns: routesManifest.rewrites.beforeFiles.filter(isInterceptionRouteRewrite).map((rewrite)=>new RegExp(rewrite.regex))
            };
        }
        return result;
    }
    async loadCustomCacheHandlers(req, nextConfig) {
        if (process.env.NEXT_RUNTIME !== 'edge') {
            const { cacheMaxMemorySize, cacheHandlers } = nextConfig;
            if (!cacheHandlers) return;
            initializeCacheHandlers(cacheMaxMemorySize);
            await registerCustomCacheHandlers(async ()=>{
                for (const [kind, handler] of Object.entries(cacheHandlers)){
                    if (!handler) continue;
                    const { formatDynamicImportPath } = require('../../lib/format-dynamic-import-path');
                    const { join } = require('node:path');
                    const absoluteProjectDir = join(/* turbopackIgnore: true */ process.cwd(), getRequestMeta(req, 'relativeProjectDir') || this.relativeProjectDir);
                    setCacheHandler(kind, interopDefault(await dynamicImportEsmDefault(formatDynamicImportPath(`${absoluteProjectDir}/${this.distDir}`, handler))));
                }
            });
        }
    }
    async getIncrementalCache(req, nextConfig, previewProps, prerenderManifest, isMinimalMode) {
        if (process.env.NEXT_RUNTIME === 'edge') {
            return globalThis.__incrementalCache;
        } else {
            var _nextConfig_i18n;
            let CacheHandler;
            const { cacheHandler } = nextConfig;
            if (cacheHandler) {
                const { formatDynamicImportPath } = require('../../lib/format-dynamic-import-path');
                CacheHandler = interopDefault(await dynamicImportEsmDefault(formatDynamicImportPath(this.distDir, cacheHandler)));
            }
            const { join } = require('node:path');
            const projectDir = join(/* turbopackIgnore: true */ process.cwd(), getRequestMeta(req, 'relativeProjectDir') || this.relativeProjectDir);
            await this.loadCustomCacheHandlers(req, nextConfig);
            // incremental-cache is request specific
            // although can have shared caches in module scope
            // per-cache handler
            const incrementalCache = new IncrementalCache({
                fs: require('../lib/node-fs-methods').nodeFs,
                dev: this.isDev,
                requestHeaders: req.headers,
                allowedRevalidateHeaderKeys: nextConfig.experimental.allowedRevalidateHeaderKeys,
                minimalMode: isMinimalMode,
                serverDistDir: `${projectDir}/${this.distDir}/server`,
                fetchCacheKeyPrefix: nextConfig.experimental.fetchCacheKeyPrefix,
                maxMemoryCacheSize: nextConfig.cacheMaxMemorySize,
                flushToDisk: !isMinimalMode && nextConfig.experimental.isrFlushToDisk,
                previewProps,
                prerenderManifest,
                CurCacheHandler: CacheHandler,
                locales: (_nextConfig_i18n = nextConfig.i18n) == null ? void 0 : _nextConfig_i18n.locales
            });
            globalThis.__incrementalCache = incrementalCache;
            return incrementalCache;
        }
    }
    async onRequestError(req, err, errorContext, silenceLog, routerServerContext) {
        if (!silenceLog) {
            if (routerServerContext == null ? void 0 : routerServerContext.logErrorWithOriginalStack) {
                routerServerContext.logErrorWithOriginalStack(err, 'app-dir');
            } else {
                console.error(err);
            }
        }
        await this.instrumentationOnRequestError(req, err, {
            path: req.url || '/',
            headers: req.headers,
            method: req.method || 'GET'
        }, errorContext);
    }
    /** A more lightweight version of `prepare()` for only retrieving the config on edge */ getNextConfigEdge(req) {
        var _nextConfig_experimental;
        if (process.env.NEXT_RUNTIME !== 'edge') {
            throw new Error('Invariant: getNextConfigEdge must only be called in edge runtime');
        }
        let serverFilesManifest = self.__SERVER_FILES_MANIFEST;
        const routerServerContext = this.getRouterServerContext(req);
        const nextConfig = (routerServerContext == null ? void 0 : routerServerContext.nextConfig) || (serverFilesManifest == null ? void 0 : serverFilesManifest.config);
        if (!nextConfig) {
            throw new Error("Invariant: nextConfig couldn't be loaded");
        }
        let deploymentId;
        if ((_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.runtimeServerDeploymentId) {
            if (!process.env.NEXT_DEPLOYMENT_ID) {
                throw new Error('process.env.NEXT_DEPLOYMENT_ID is missing but runtimeServerDeploymentId is enabled');
            }
            deploymentId = process.env.NEXT_DEPLOYMENT_ID;
        } else {
            deploymentId = nextConfig.deploymentId || '';
        }
        return {
            nextConfig,
            deploymentId
        };
    }
    /**
   * Runs a route handler that was invoked directly (e.g. by an adapter or a
   * deployment, without next-server) inside its request span
   * (`BaseServer.handleRequest`).
   *
   * The span is started before `fn` calls `prepare`, so everything done for
   * the request, including route module preparation, belongs to the request's
   * trace. When the handler is wrapped by next-server, which already started
   * the request span, `fn` runs inside that active span instead.
   *
   * Callers must await `ensureInstrumentation` before calling this: on the
   * first request, registering `instrumentation.ts` usually installs the
   * tracer provider, and a span started earlier would not be recorded. With
   * the `instrumentation` it returned, the request span is backdated to cover
   * registration, and the lifecycle spans of `instrumentation.ts` are children
   * of the request span when this request triggered registration.
   *
   * `fn` receives the request span and the request's root span: the span that
   * was active when the handler was invoked (next-server's request span, or a
   * platform-created HTTP span), or the request span itself when there is no
   * such span.
   *
   * `tracer` must be the caller's tracer: route modules are bundled with their
   * own copy of the tracer, whose root span bookkeeping (e.g.
   * `getRootSpanAttributes`) the caller can't see.
   *
   * @internal - only called by the Next.js build templates. Kept out of the
   * published type declarations, which can't reference the tracer's types.
   */ async traceRequest(req, { tracer, spanName, httpTarget, instrumentation }, fn) {
        var _this_getRouterServerContext;
        const activeSpan = tracer.getActiveScopeSpan();
        const isWrappedByNextServer = Boolean((_this_getRouterServerContext = this.getRouterServerContext(req)) == null ? void 0 : _this_getRouterServerContext.isWrappedByNextServer);
        // TODO: activeSpan code path is for when wrapped by
        // next-server can be removed when this is no longer used
        if (isWrappedByNextServer && activeSpan) {
            return fn(activeSpan, activeSpan);
        }
        return tracer.withPropagatedContext(req.headers, ()=>tracer.trace(BaseServerSpan.handleRequest, {
                spanName,
                kind: SpanKind.SERVER,
                startTime: instrumentation == null ? void 0 : instrumentation.startTime,
                attributes: {
                    'http.method': req.method || 'GET',
                    'http.target': httpTarget
                }
            }, (span)=>{
                var _instrumentation_emitSpans;
                instrumentation == null ? void 0 : (_instrumentation_emitSpans = instrumentation.emitSpans) == null ? void 0 : _instrumentation_emitSpans.call(instrumentation);
                return fn(span, activeSpan ?? span);
            }), undefined, !isWrappedByNextServer);
    }
    prepare(req, res, options) {
        return getTracer().trace(RouteModuleSpan.prepare, {
            spanName: 'prepare route module'
        }, ()=>this.prepareImpl(req, res, options));
    }
    /**
   * Makes sure `instrumentation.ts` is registered for the Node.js runtime.
   * Safe to call more than once per request. Returns the absolute project
   * directory (`undefined` in the edge runtime, which handles loading
   * instrumentation at the edge adapter level).
   *
   * With `deferSpans` (callers of `traceRequest`), it also returns the
   * `instrumentation` to pass to `traceRequest`: when this call triggered
   * registration, the lifecycle spans of `instrumentation.ts` are not emitted
   * yet but emitted inside the request span.
   *
   * @internal - called by `prepare` and by the Next.js build templates before
   * `traceRequest`.
   */ async ensureInstrumentation(req, { deferSpans = false } = {}) {
        let absoluteProjectDir;
        const instrumentation = deferSpans ? {
            startTime: performance.timeOrigin + performance.now()
        } : undefined;
        if (process.env.NEXT_RUNTIME !== 'edge') {
            const { join, relative } = require('node:path');
            absoluteProjectDir = join(/* turbopackIgnore: true */ process.cwd(), getRequestMeta(req, 'relativeProjectDir') || this.relativeProjectDir);
            const absoluteDistDir = getRequestMeta(req, 'distDir');
            if (absoluteDistDir) {
                this.distDir = relative(absoluteProjectDir, absoluteDistDir);
            }
            const { ensureInstrumentationRegistered, ensureInstrumentationRegisteredWithDeferredSpans } = await import('../lib/router-utils/instrumentation-globals.external.js');
            // ensure instrumentation is registered and pass
            // onRequestError below. Awaited so any caller of `RouteModule.prepare`
            // that bypasses `BaseServer.handleRequest` (where this is also awaited
            // via `prepareImpl`) still observes the instrumentation hook completing
            // before the userland route handler runs.
            if (instrumentation) {
                instrumentation.emitSpans = await ensureInstrumentationRegisteredWithDeferredSpans(absoluteProjectDir, this.distDir);
            } else {
                await ensureInstrumentationRegistered(absoluteProjectDir, this.distDir);
            }
        }
        return {
            absoluteProjectDir,
            instrumentation
        };
    }
    async prepareImpl(req, res, { srcPage, multiZoneDraftMode }) {
        var _req_headers_xforwardedproto, _nextConfig_experimental;
        if (process.env.NEXT_RUNTIME !== 'edge' && res) {
            patchSetHeaderWithCookieSupport(req, res);
        }
        const { absoluteProjectDir } = await this.ensureInstrumentation(req);
        const manifests = getTracer().trace(RouteModuleSpan.loadManifests, {
            spanName: 'load route manifests'
        }, ()=>this.loadManifests(srcPage, absoluteProjectDir));
        const { routesManifest, previewProps, serverFilesManifest } = manifests;
        const { basePath, i18n, rewrites } = routesManifest;
        const routerServerContext = this.getRouterServerContext(req);
        const nextConfig = (routerServerContext == null ? void 0 : routerServerContext.nextConfig) || (serverFilesManifest == null ? void 0 : serverFilesManifest.config);
        // Injected in base-server.ts
        const protocol = ((_req_headers_xforwardedproto = req.headers['x-forwarded-proto']) == null ? void 0 : _req_headers_xforwardedproto.includes('https')) ? 'https' : 'http';
        // When there are hostname and port we build an absolute URL
        if (!getRequestMeta(req, 'initURL')) {
            const initUrl = (serverFilesManifest == null ? void 0 : serverFilesManifest.config.experimental.trustHostHeader) ? `${protocol}://${req.headers.host || 'localhost'}${req.url}` : `${protocol}://${(routerServerContext == null ? void 0 : routerServerContext.hostname) || 'localhost'}${req.url}`;
            addRequestMeta(req, 'initURL', initUrl);
            addRequestMeta(req, 'initProtocol', protocol);
        }
        if (basePath) {
            req.url = removePathPrefix(req.url || '/', basePath);
        }
        const parsedUrl = parseReqUrl(req.url || '/');
        addRequestMeta(req, 'initQuery', {
            ...parsedUrl == null ? void 0 : parsedUrl.query
        });
        // if we couldn't parse the URL we can't continue
        if (!parsedUrl) {
            return;
        }
        let isNextDataRequest = false;
        if (pathHasPrefix(parsedUrl.pathname || '/', '/_next/data')) {
            isNextDataRequest = true;
            parsedUrl.pathname = normalizeDataPath(parsedUrl.pathname || '/');
        }
        this.normalizeUrl(req, parsedUrl);
        let originalPathname = parsedUrl.pathname || '/';
        const originalQuery = {
            ...parsedUrl.query
        };
        const pageIsDynamic = isDynamicRoute(srcPage);
        let localeResult;
        let detectedLocale;
        if (i18n) {
            localeResult = normalizeLocalePath(parsedUrl.pathname || '/', i18n.locales);
            if (localeResult.detectedLocale) {
                req.url = `${localeResult.pathname}${parsedUrl.search}`;
                originalPathname = localeResult.pathname;
                if (!detectedLocale) {
                    detectedLocale = localeResult.detectedLocale;
                }
            }
        }
        // Normalize the page path for route matching. The srcPage contains the
        // internal page path (e.g., /app/[slug]/page), but route matchers expect
        // the pathname format (e.g., /app/[slug]).
        const normalizedSrcPage = normalizeAppPath(srcPage);
        const serverUtils = getServerUtils({
            page: normalizedSrcPage,
            i18n,
            basePath,
            rewrites,
            pageIsDynamic,
            trailingSlash: process.env.__NEXT_TRAILING_SLASH,
            caseSensitive: Boolean(routesManifest.caseSensitive)
        });
        const domainLocale = detectDomainLocale(i18n == null ? void 0 : i18n.domains, getHostname(parsedUrl, req.headers), detectedLocale);
        if (Boolean(domainLocale)) {
            addRequestMeta(req, 'isLocaleDomain', Boolean(domainLocale));
        }
        const defaultLocale = getRequestMeta(req, 'defaultLocale') || (domainLocale == null ? void 0 : domainLocale.defaultLocale) || (i18n == null ? void 0 : i18n.defaultLocale);
        // Ensure parsedUrl.pathname includes locale before processing
        // rewrites or they won't match correctly.
        if (defaultLocale && !detectedLocale) {
            parsedUrl.pathname = `/${defaultLocale}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}`;
        }
        const locale = getRequestMeta(req, 'locale') || detectedLocale || defaultLocale;
        // we apply rewrites against cloned URL so that we don't
        // modify the original with the rewrite destination
        const { rewriteParams, rewrittenParsedUrl } = serverUtils.handleRewrites(req, parsedUrl);
        const rewriteParamKeys = Object.keys(rewriteParams);
        Object.assign(parsedUrl.query, rewrittenParsedUrl.query);
        // after processing rewrites we want to remove locale
        // from parsedUrl pathname
        if (i18n) {
            parsedUrl.pathname = normalizeLocalePath(parsedUrl.pathname || '/', i18n.locales).pathname;
            rewrittenParsedUrl.pathname = normalizeLocalePath(rewrittenParsedUrl.pathname || '/', i18n.locales).pathname;
        }
        let params = getRequestMeta(req, 'params');
        // attempt parsing from pathname
        if (!params && serverUtils.dynamicRouteMatcher) {
            const paramsMatch = serverUtils.dynamicRouteMatcher(normalizeDataPath((rewrittenParsedUrl == null ? void 0 : rewrittenParsedUrl.pathname) || parsedUrl.pathname || '/'));
            const paramsResult = serverUtils.normalizeDynamicRouteParams(paramsMatch || {}, true);
            if (paramsResult.hasValidParams) {
                params = paramsResult.params;
            }
        }
        // Local "next start" expects the routing parsed query values
        // to not be present in the URL although when deployed proxies
        // will add query values from resolving the routes to pass to function.
        // TODO: do we want to change expectations for "next start"
        // to include these query values in the URL which affects asPath
        // but would match deployed behavior, e.g. a rewrite from middleware
        // that adds a query param would be in asPath as query but locally
        // it won't be in the asPath but still available in the query object
        const query = getRequestMeta(req, 'query') || {
            ...parsedUrl.query
        };
        const routeParamKeys = new Set();
        const combinedParamKeys = [];
        // We don't include rewriteParamKeys in the combinedParamKeys
        // for app router since the searchParams is populated from the
        // URL so we don't want to strip the rewrite params from the URL
        // so that searchParams can include them.
        if (this.definition.kind === RouteKind.PAGES || this.definition.kind === RouteKind.PAGES_API) {
            for (const key of [
                ...rewriteParamKeys,
                ...Object.keys(serverUtils.defaultRouteMatches || {})
            ]){
                // We only want to filter rewrite param keys from the URL
                // if they are matches from the URL e.g. the key/value matches
                // before and after applying the rewrites /:path for /hello and
                // { path: 'hello' } but not for { path: 'another' } and /hello
                // TODO: we should prefix rewrite param keys the same as we do
                // for dynamic routes so we can identify them properly
                const originalValue = Array.isArray(originalQuery[key]) ? originalQuery[key].join('') : originalQuery[key];
                const queryValue = Array.isArray(query[key]) ? query[key].join('') : query[key];
                if (!(key in originalQuery) || originalValue === queryValue) {
                    combinedParamKeys.push(key);
                }
            }
        }
        serverUtils.normalizeCdnUrl(req, combinedParamKeys);
        // When Next is not hosted in a single process, upstream proxies will add query values for route params that were used to match the route.
        // Outside of that environment, there is no reason to do any normalization to honor those query values.
        if (!(routerServerContext == null ? void 0 : routerServerContext.isWrappedByNextServer)) {
            serverUtils.normalizeQueryParams(query, routeParamKeys);
        } else {
            serverUtils.filterInternalQuery(query, []);
        }
        serverUtils.filterInternalQuery(originalQuery, combinedParamKeys);
        if (pageIsDynamic) {
            const queryResult = serverUtils.normalizeDynamicRouteParams(query, true);
            const paramsResult = serverUtils.normalizeDynamicRouteParams(params || {}, true);
            let paramsToInterpolate;
            if (// if both query and params are valid but one
            // provided more information and the query params
            // were nxtP prefixed rely on that one
            query && params && paramsResult.hasValidParams && queryResult.hasValidParams && routeParamKeys.size > 0 && Object.keys(paramsResult.params).length <= Object.keys(queryResult.params).length) {
                paramsToInterpolate = queryResult.params;
                params = Object.assign(queryResult.params);
            } else {
                paramsToInterpolate = paramsResult.hasValidParams && params ? params : queryResult.hasValidParams ? query : {};
            }
            req.url = serverUtils.interpolateDynamicPath(req.url || '/', paramsToInterpolate);
            parsedUrl.pathname = serverUtils.interpolateDynamicPath(parsedUrl.pathname || '/', paramsToInterpolate);
            originalPathname = serverUtils.interpolateDynamicPath(originalPathname, paramsToInterpolate);
            // try pulling from query if valid
            if (!params) {
                if (queryResult.hasValidParams) {
                    params = Object.assign({}, queryResult.params);
                    // If we pulled from query remove it so it's
                    // only in params
                    for(const key in serverUtils.defaultRouteMatches){
                        delete query[key];
                    }
                } else {
                    // use final params from URL matching
                    const paramsMatch = serverUtils.dynamicRouteMatcher == null ? void 0 : serverUtils.dynamicRouteMatcher.call(serverUtils, normalizeDataPath((localeResult == null ? void 0 : localeResult.pathname) || parsedUrl.pathname || '/'));
                    // we don't normalize these as they are allowed to be
                    // the literal slug matches here e.g. /blog/[slug]
                    // actually being requested
                    if (paramsMatch) {
                        params = Object.assign({}, paramsMatch);
                    }
                }
            }
            // When partial nxtP* params are provided (e.g. background
            // revalidation for intermediate PPR shells), both
            // normalizeDynamicRouteParams calls above fail because not all
            // route params are present. Merge the normalized query params
            // (from nxtP*) into the current params to override placeholders
            // with concrete values.
            if (params && routeParamKeys.size > 0 && !paramsResult.hasValidParams && !queryResult.hasValidParams) {
                for (const key of routeParamKeys){
                    if (query[key] !== undefined) {
                        params[key] = query[key];
                    }
                }
                addRequestMeta(req, 'resolvedRouteParamKeys', routeParamKeys);
            }
        }
        // Remove any normalized params from the query if they
        // weren't present as non-prefixed query key e.g.
        // ?search=1&nxtPsearch=hello we don't delete search
        for (const key of routeParamKeys){
            if (!(key in originalQuery)) {
                delete query[key];
            // handle the case where there's collision and we
            // normalized nxtPid=123 -> id=123 but user also
            // sends id=456 as separate key
            } else if (originalQuery[key] && query[key] && originalQuery[key] !== query[key]) {
                query[key] = originalQuery[key];
            }
        }
        const { isOnDemandRevalidate, revalidateOnlyGenerated } = checkIsOnDemandRevalidate(req.headers, previewProps);
        let isDraftMode = false;
        let previewData;
        // preview data relies on non-edge utils
        if (process.env.NEXT_RUNTIME !== 'edge' && res) {
            const { tryGetPreviewData } = require('../api-utils/node/try-get-preview-data');
            previewData = tryGetPreviewData(req, res, previewProps, Boolean(multiZoneDraftMode));
            isDraftMode = previewData !== false;
        }
        if (!nextConfig) {
            throw new Error("Invariant: nextConfig couldn't be loaded");
        }
        if (process.env.NEXT_RUNTIME !== 'edge') {
            const { installProcessErrorHandlers } = require('../node-environment-extensions/process-error-handlers');
            installProcessErrorHandlers(Boolean(nextConfig.experimental.removeUncaughtErrorAndRejectionListeners));
        }
        let resolvedPathname = normalizedSrcPage;
        if (isDynamicRoute(resolvedPathname) && params) {
            resolvedPathname = serverUtils.interpolateDynamicPath(resolvedPathname, params);
        }
        if (resolvedPathname === '/index') {
            resolvedPathname = '/';
        }
        if (res && Boolean(req.headers['x-nextjs-data']) && (!res.statusCode || res.statusCode === 200)) {
            res.setHeader('x-nextjs-matched-path', removeTrailingSlash(`${locale ? `/${locale}` : ''}${normalizedSrcPage}`));
        }
        const encodedResolvedPathname = resolvedPathname;
        // we decode for cache key/manifest usage encoded is
        // for URL building
        try {
            resolvedPathname = decodePathParams(resolvedPathname);
        } catch (_) {}
        resolvedPathname = removeTrailingSlash(resolvedPathname);
        let deploymentId;
        if ((_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.runtimeServerDeploymentId) {
            if (!process.env.NEXT_DEPLOYMENT_ID) {
                throw new Error('process.env.NEXT_DEPLOYMENT_ID is missing but runtimeServerDeploymentId is enabled');
            }
            deploymentId = process.env.NEXT_DEPLOYMENT_ID;
        } else {
            deploymentId = nextConfig.deploymentId || '';
        }
        return {
            query,
            originalQuery,
            originalPathname,
            params,
            parsedUrl,
            locale,
            isNextDataRequest,
            locales: i18n == null ? void 0 : i18n.locales,
            defaultLocale,
            isDraftMode,
            previewData,
            pageIsDynamic,
            resolvedPathname,
            encodedResolvedPathname,
            isOnDemandRevalidate,
            revalidateOnlyGenerated,
            ...manifests,
            // loadManifest returns a readonly object, but we don't want to propagate that throughout the
            // whole codebase (for now)
            nextConfig: nextConfig,
            routerServerContext,
            deploymentId,
            clientAssetToken: nextConfig.supportsImmutableAssets ? '' : deploymentId
        };
    }
    getResponseCache(req) {
        if (!this.responseCache) {
            const minimalMode = getRequestMeta(req, 'minimalMode') ?? false;
            this.responseCache = new ResponseCache({
                minimalMode,
                route: this.cacheOwner
            });
        }
        return this.responseCache;
    }
    async handleResponse({ req, nextConfig, cacheKey, routeKind, isFallback, previewProps, prerenderManifest, isRoutePPREnabled, isOnDemandRevalidate, revalidateOnlyGenerated, responseGenerator, waitUntil, isMinimalMode }) {
        const responseCache = this.getResponseCache(req);
        const cacheEntry = await responseCache.get(cacheKey, responseGenerator, {
            routeKind,
            isFallback,
            isRoutePPREnabled,
            isOnDemandRevalidate,
            // A Next.js Segment Cache prefetch uses the `Next-Router-Prefetch`
            // header (surfaced as the `isPrefetchRSCRequest` request meta), not the
            // standard browser `purpose: prefetch` header. Recognize both so the
            // response cache treats segment prefetches as prefetches — most
            // importantly, so a prefetch that misses serves a fallback shell rather
            // than joining an in-flight background (concrete) revalidation.
            isPrefetch: req.headers.purpose === 'prefetch' || getRequestMeta(req, 'isPrefetchRSCRequest') === true,
            // Use x-invocation-id header to scope the in-memory cache to a single
            // revalidation request in minimal mode.
            invocationID: req.headers['x-invocation-id'],
            incrementalCache: await this.getIncrementalCache(req, nextConfig, previewProps, prerenderManifest, isMinimalMode),
            waitUntil
        });
        if (!cacheEntry) {
            if (cacheKey && // revalidate only generated can bail even if cacheKey is provided
            !(isOnDemandRevalidate && revalidateOnlyGenerated)) {
                // A cache entry might not be generated if a response is written
                // in `getInitialProps` or `getServerSideProps`, but those shouldn't
                // have a cache key. If we do have a cache key but we don't end up
                // with a cache entry, then either Next.js or the application has a
                // bug that needs fixing.
                throw new Error('invariant: cache entry required but not generated');
            }
        }
        return cacheEntry;
    }
}

//# sourceMappingURL=route-module.js.map