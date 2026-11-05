"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createAppPageEntrypoint", {
    enumerable: true,
    get: function() {
        return createAppPageEntrypoint;
    }
});
const _modulecompiled = require("../../server/route-modules/app-page/module.compiled");
const _devrendercontext = require("../../server/route-modules/app-page/dev-render-context");
const _routekind = require("../../server/route-kind");
const _utils = require("../../server/instrumentation/utils");
const _tracer = require("../../server/lib/trace/tracer");
const _requestmeta = require("../../server/request-meta");
const _constants = require("../../server/lib/trace/constants");
const _stripflightheaders = require("../../server/app-render/strip-flight-headers");
const _parserequestheaders = require("../../server/route-modules/app-page/parse-request-headers");
const _node = require("../../server/base-http/node");
const _isrscrequest = require("../../server/lib/is-rsc-request");
const _isnonhtmlsecfetchdest = require("../../server/lib/is-non-html-sec-fetch-dest");
const _entryconstants = require("../../shared/lib/entry-constants");
const _fallbackparams = require("../../server/request/fallback-params");
const _manifestssingleton = require("../../server/app-render/manifests-singleton");
const _streamingmetadata = require("../../server/lib/streaming-metadata");
const _apppaths = require("../../shared/lib/router/utils/app-paths");
const _app = require("../../shared/lib/router/routes/app");
const _serveractionrequestmeta = require("../../server/lib/server-action-request-meta");
const _approuterheaders = require("../../client/components/app-router-headers");
const _isbot = require("../../shared/lib/router/utils/is-bot");
const _responsecache = require("../../server/response-cache");
const _fallback = require("../../lib/fallback");
const _renderresult = /*#__PURE__*/ _interop_require_default(require("../../server/render-result"));
const _constants1 = require("../../lib/constants");
const _encodedtags = require("../../server/stream-utils/encoded-tags");
const _sendpayload = require("../../server/send-payload");
const _nofallbackerrorexternal = require("../../shared/lib/no-fallback-error.external");
const _routecachekey = require("../../server/lib/route-cache-key");
const _sizelimit = require("../../shared/lib/size-limit");
const _postponedrequestbody = require("../../server/lib/postponed-request-body");
const _url = require("../../lib/url");
const _entrybase = /*#__PURE__*/ _interop_require_wildcard(require("../../server/app-render/entry-base"));
const _redirectstatuscode = require("../../client/components/redirect-status-code");
const _invarianterror = require("../../shared/lib/invariant-error");
const _scheduler = require("../../lib/scheduler");
const _getsegmentparam = require("../../shared/lib/router/utils/get-segment-param");
const _turbopackbootstrapscript = require("../../server/app-render/turbopack-bootstrap-script");
const _getscriptnoncefromheader = require("../../server/app-render/get-script-nonce-from-header");
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
/**
 * Builds the cache key for the most complete prerenderable shell we can derive
 * from the shell that matched this request. Only params that can still be
 * filled by `generateStaticParams` are substituted; fully dynamic params stay
 * as placeholders so a request like `/c/foo` can complete `/[one]/[two]` into
 * `/c/[two]` rather than `/c/foo`.
 */ function buildCompletedShellCacheKey(fallbackPathname, remainingPrerenderableParams, params) {
    const prerenderableParamsByName = new Map(remainingPrerenderableParams.map((param)=>[
            param.paramName,
            param
        ]));
    return fallbackPathname.split('/').map((segment)=>{
        const segmentParam = (0, _getsegmentparam.getSegmentParam)(segment);
        if (!segmentParam) {
            return segment;
        }
        const remainingParam = prerenderableParamsByName.get(segmentParam.paramName);
        if (!remainingParam) {
            return segment;
        }
        const value = params == null ? void 0 : params[remainingParam.paramName];
        if (!value) {
            return segment;
        }
        const encodedValue = Array.isArray(value) ? value.map((item)=>encodeURIComponent(item)).join('/') : encodeURIComponent(value);
        return segment.replace((0, _fallbackparams.buildDynamicSegmentPlaceholder)(remainingParam), encodedValue);
    }).join('/') || '/';
}
function createAppPageEntrypoint({ tree, page, pathname, require: __next_app_require__, loadChunk: __next_app_load_chunk__, interopDefault }) {
    const __next_app__ = {
        require: __next_app_require__,
        loadChunk: __next_app_load_chunk__
    };
    const routeModule = new _modulecompiled.AppPageRouteModule({
        definition: {
            kind: _routekind.RouteKind.APP_PAGE,
            page,
            pathname,
            // The following aren't used in production.
            bundlePath: '',
            filename: '',
            appPaths: []
        },
        userland: {
            loaderTree: tree
        },
        distDir: process.env.__NEXT_RELATIVE_DIST_DIR || '',
        relativeProjectDir: process.env.__NEXT_RELATIVE_PROJECT_DIR || ''
    });
    let srcPage = page;
    // turbopack doesn't normalize `/index` in the page name
    // so we need to to process dynamic routes properly
    // TODO: fix turbopack providing differing value from webpack
    if (process.env.TURBOPACK) {
        srcPage = srcPage.replace(/\/index$/, '') || '/';
    } else if (srcPage === '/index') {
        // we always normalize /index specifically
        srcPage = '/';
    }
    const normalizedSrcPage = (0, _apppaths.normalizeAppPath)(srcPage);
    // The legacy prerender manifest says whether unmatched values return 404,
    // but does not list all of the route's parameter names. Read them from the
    // route pattern once, since the names do not depend on the request.
    const routeParamNames = (0, _app.parseNormalizedAppRoute)(normalizedSrcPage).dynamicSegments.map((segment)=>segment.param.paramName);
    async function handler(req, res, ctx) {
        if (ctx.requestMeta) {
            (0, _requestmeta.setRequestMeta)(req, ctx.requestMeta);
        }
        if (routeModule.isDev) {
            (0, _requestmeta.addRequestMeta)(req, 'devRequestTimingInternalsEnd', process.hrtime.bigint());
        }
        const isMinimalMode = Boolean((0, _requestmeta.getRequestMeta)(req, 'minimalMode'));
        // Capture the request target before `prepare()` runs, since route
        // normalization (e.g. `normalizeCdnUrl`) rewrites `req.url` and would
        // otherwise change the `http.target` span attribute. This mirrors
        // `BaseServer.handleRequest`, which records the target before normalization.
        const httpTarget = req.url;
        const multiZoneDraftMode = process.env.__NEXT_MULTI_ZONE_DRAFT_MODE;
        // Registering `instrumentation.ts` usually installs the tracer provider, so
        // do it before starting the request span. The span is started before
        // `prepare`, so route module preparation is part of the request's trace.
        // When this request triggers registration, the lifecycle spans of
        // `instrumentation.ts` are emitted inside the request span.
        const { instrumentation } = await routeModule.ensureInstrumentation(req, {
            deferSpans: true
        });
        return routeModule.traceRequest(req, {
            tracer: (0, _tracer.getTracer)(),
            spanName: `${req.method || 'GET'} ${srcPage}`,
            httpTarget,
            instrumentation
        }, (requestSpan, requestRootSpan)=>handleRequest(req, res, ctx, isMinimalMode, multiZoneDraftMode, requestSpan, requestRootSpan));
    }
    async function handleRequest(req, res, ctx, isMinimalMode, multiZoneDraftMode, requestSpan, requestRootSpan) {
        var _this, _prerenderInfo_fallbackRouteParams, _prerenderInfo_fallbackRootParams, _prerenderInfo_fallbackRouteParams1, _prerenderInfo_fallbackRouteParams2;
        const prepareResult = await routeModule.prepare(req, res, {
            srcPage,
            multiZoneDraftMode
        });
        if (!prepareResult) {
            res.statusCode = 400;
            res.end('Bad Request');
            ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());
            return null;
        }
        const { buildId, query, params, pageIsDynamic, buildManifest, nextFontManifest, reactLoadableManifest, serverActionsManifest, clientReferenceManifest, subresourceIntegrityManifest, prerenderManifest, prefetchHintsManifest, isDraftMode, resolvedPathname, revalidateOnlyGenerated, routerServerContext, nextConfig, parsedUrl, interceptionRoutePatterns, deploymentId, clientAssetToken, previewProps } = prepareResult;
        let { isOnDemandRevalidate } = prepareResult;
        // We use the resolvedPathname instead of the parsedUrl.pathname because it
        // is not rewritten as resolvedPathname is. This will ensure that the correct
        // prerender info is used instead of using the original pathname as the
        // source.
        const prerenderMatch = routeModule.match(resolvedPathname, prerenderManifest);
        const prerenderInfo = (prerenderMatch == null ? void 0 : prerenderMatch.route) ?? null;
        // A sibling's prerender must not change this route's rendering mode or
        // supply prefetch metadata for its response.
        const prerenderedRoute = routeModule.isDev || (0, _routecachekey.isRouteCacheOwner)(resolvedPathname, routeModule.cacheOwner, prerenderManifest.routes[resolvedPathname]) ? prerenderManifest.routes[resolvedPathname] : undefined;
        const isPrerendered = Boolean(prerenderedRoute);
        const userAgent = req.headers['user-agent'] || '';
        const botType = (0, _isbot.getBotType)(userAgent);
        /**
     * If true, this indicates that the request being made is for an app
     * prefetch request.
     */ const isPrefetchRSCRequest = (0, _requestmeta.getRequestMeta)(req, 'isPrefetchRSCRequest') ?? req.headers[_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER] === '1' // exclude runtime prefetches, which use '2'
        ;
        // NOTE: Don't delete headers[RSC] yet, it still needs to be used in renderToHTML later
        const isRSCRequest = (0, _requestmeta.getRequestMeta)(req, 'isRSCRequest') ?? (0, _isrscrequest.isRSCRequestHeader)(req.headers[_approuterheaders.RSC_HEADER]);
        const isPossibleServerAction = (0, _serveractionrequestmeta.getIsPossibleServerAction)(req);
        // For subresource requests (e.g. images or fonts), return plain text 404
        // instead of rendering the not-found route.
        if (normalizedSrcPage === _entryconstants.UNDERSCORE_NOT_FOUND_ROUTE && (req.method === 'GET' || req.method === 'HEAD') && !isRSCRequest && (0, _isnonhtmlsecfetchdest.isNonHtmlSecFetchDest)(req.headers['sec-fetch-dest'])) {
            res.statusCode = 404;
            res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Not Found');
            ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());
            return null;
        }
        /**
     * If the route being rendered is an app page, and the ppr feature has been
     * enabled, then the given route _could_ support PPR.
     */ const couldSupportPPR = Boolean(nextConfig.cacheComponents);
        // Stash postponed state for server actions when in minimal mode.
        // We extract it here so the RDC is available for the re-render after the action completes.
        const resumeStateLengthHeader = req.headers[_constants1.NEXT_RESUME_STATE_LENGTH_HEADER];
        if (!(0, _requestmeta.getRequestMeta)(req, 'postponed') && isMinimalMode && couldSupportPPR && isPossibleServerAction && resumeStateLengthHeader && typeof resumeStateLengthHeader === 'string') {
            const stateLength = parseInt(resumeStateLengthHeader, 10);
            const { maxPostponedStateSize, maxPostponedStateSizeBytes } = (0, _postponedrequestbody.getMaxPostponedStateSize)(nextConfig.experimental.maxPostponedStateSize);
            if (!isNaN(stateLength) && stateLength > 0) {
                var _nextConfig_experimental_serverActions;
                if (stateLength > maxPostponedStateSizeBytes) {
                    res.statusCode = 413;
                    res.end((0, _postponedrequestbody.getPostponedStateExceededErrorMessage)(maxPostponedStateSize));
                    ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());
                    return null;
                }
                // Calculate max total body size to prevent buffering excessively large
                // payloads before the action handler checks. We use stateLength (not
                // maxPostponedStateSizeBytes) so the postponed state doesn't eat into
                // the action body budget - it's already validated above.
                const defaultActionBodySizeLimit = '1 MB';
                const actionBodySizeLimit = ((_nextConfig_experimental_serverActions = nextConfig.experimental.serverActions) == null ? void 0 : _nextConfig_experimental_serverActions.bodySizeLimit) ?? defaultActionBodySizeLimit;
                const actionBodySizeLimitBytes = actionBodySizeLimit !== defaultActionBodySizeLimit ? require('next/dist/compiled/bytes').parse(actionBodySizeLimit) : 1024 * 1024 // 1 MB
                ;
                const maxTotalBodySize = stateLength + actionBodySizeLimitBytes;
                const fullBody = await (0, _postponedrequestbody.readBodyWithSizeLimit)(req, maxTotalBodySize);
                if (fullBody === null) {
                    res.statusCode = 413;
                    res.end(`Request body exceeded limit. ` + `To configure the body size limit for Server Actions, see: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit`);
                    ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());
                    return null;
                }
                if (fullBody.length >= stateLength) {
                    // Extract postponed state from the beginning
                    const postponedState = fullBody.subarray(0, stateLength).toString('utf8');
                    (0, _requestmeta.addRequestMeta)(req, 'postponed', postponedState);
                    // Store the remaining action body for the action handler
                    const actionBody = fullBody.subarray(stateLength);
                    (0, _requestmeta.addRequestMeta)(req, 'actionBody', actionBody);
                } else {
                    throw new Error(`invariant: expected ${stateLength} bytes of postponed state but only received ${fullBody.length} bytes`);
                }
            }
        }
        if (typeof (0, _requestmeta.getRequestMeta)(req, 'postponed') !== 'string' && couldSupportPPR && req.headers[_constants1.NEXT_RESUME_HEADER] === '1' && req.method === 'POST') {
            const { maxPostponedStateSize, maxPostponedStateSizeBytes } = (0, _postponedrequestbody.getMaxPostponedStateSize)(nextConfig.experimental.maxPostponedStateSize);
            // Decode the postponed state from the request body, it will come as
            // an array of buffers, so collect them and then concat them to form
            // the string.
            const body = await (0, _postponedrequestbody.readBodyWithSizeLimit)(req, maxPostponedStateSizeBytes);
            if (body === null) {
                res.statusCode = 413;
                res.end((0, _postponedrequestbody.getPostponedStateExceededErrorMessage)(maxPostponedStateSize));
                ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());
                return null;
            }
            const postponed = body.toString('utf8');
            (0, _requestmeta.addRequestMeta)(req, 'postponed', postponed);
        }
        // When enabled, this will allow the use of the `?__nextppronly` query to
        // enable debugging of the static shell.
        const hasDebugStaticShellQuery = process.env.__NEXT_EXPERIMENTAL_STATIC_SHELL_DEBUGGING === '1' && typeof query.__nextppronly !== 'undefined' && couldSupportPPR;
        // When enabled, this will allow the use of the `?__nextppronly` query
        // to enable debugging of the fallback shell.
        const hasDebugFallbackShellQuery = hasDebugStaticShellQuery && query.__nextppronly === 'fallback';
        // Whether the testing API is exposed (dev mode or explicit flag)
        const exposeTestingApi = nextConfig.cacheComponents === true && (routeModule.isDev === true || nextConfig.experimental.exposeTestingApiInProductionBuild === true);
        // Enable the Instant Navigation Testing API. Renders only the prefetched
        // portion of the page, excluding dynamic content. This allows tests to
        // assert on the prefetched UI state deterministically.
        //
        // The instant test cookie is sent automatically with all requests while a
        // navigation lock is held. We treat a request as a test render when the
        // cookie is present and either:
        // - it's a document request (no RSC header) — covers MPA navigations
        // - it's a prefetch RSC request — covers client-side prefetches
        // Regular RSC navigation requests proceed normally even during a locked
        // scope; blocking happens on the client side.
        const isInstantNavigationTest = exposeTestingApi && typeof req.headers.cookie === 'string' && req.headers.cookie.includes(_approuterheaders.NEXT_INSTANT_TEST_COOKIE + '=') && (!(0, _isrscrequest.isRSCRequestHeader)(req.headers[_approuterheaders.RSC_HEADER]) || req.headers[_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER] === '1');
        // This page supports PPR if it is marked as being `PARTIALLY_STATIC` in the
        // prerender manifest and this is an app page.
        const isRoutePPREnabled = couldSupportPPR && (((_this = prerenderManifest.routes[normalizedSrcPage] ?? prerenderManifest.dynamicRoutes[normalizedSrcPage]) == null ? void 0 : _this.renderingMode) === 'PARTIALLY_STATIC' || // Ideally we'd want to check the appConfig to see if this page has PPR
        // enabled or not, but that would require plumbing the appConfig through
        // to the server during development. We assume that the page supports it
        // but only during development or when the testing API is exposed.
        (hasDebugStaticShellQuery || isInstantNavigationTest) && (exposeTestingApi || (routerServerContext == null ? void 0 : routerServerContext.experimentalTestProxy) === true));
        const isDebugStaticShell = (hasDebugStaticShellQuery || isInstantNavigationTest) && isRoutePPREnabled;
        // We should enable debugging dynamic accesses when the static shell
        // debugging has been enabled and we're also in development mode.
        const isDebugDynamicAccesses = isDebugStaticShell && routeModule.isDev === true;
        const isDebugFallbackShell = hasDebugFallbackShellQuery && isRoutePPREnabled;
        const isDebugPrerender = isDebugStaticShell || isDebugDynamicAccesses || isDebugFallbackShell;
        // If we're in minimal mode, then try to get the postponed information from
        // the request metadata. If available, use it for resuming the postponed
        // render.
        const minimalPostponed = isRoutePPREnabled ? (0, _requestmeta.getRequestMeta)(req, 'postponed') : undefined;
        const hasPostponedState = typeof minimalPostponed === 'string';
        // If PPR is enabled, and this is a RSC request (but not a prefetch), then
        // we can use this fact to only generate the flight data for the request
        // because we can't cache the HTML (as it's also dynamic).
        const staticPrefetchDataRoute = prerenderedRoute == null ? void 0 : prerenderedRoute.prefetchDataRoute;
        const isEnsureStaticPage = (prerenderInfo == null ? void 0 : prerenderInfo._isEnsureStaticPage) === true;
        let isDynamicRSCRequest = isRoutePPREnabled && isRSCRequest && !isPrefetchRSCRequest && // If generated at build time, treat the RSC request as static
        // so we can serve the prebuilt .rsc without a dynamic render.
        // Only do this for routes that have a concrete prefetchDataRoute.
        !staticPrefetchDataRoute && // Do not serve `ensureStatic = "navigation"` with a dynamic response,
        // (we want to do a blocking prerender instead)
        // TODO(ensure-static): express this in a cleaner way
        !isEnsureStaticPage;
        // During a PPR revalidation, the RSC request is not dynamic if postponed
        // metadata is absent. An empty string represents a resume request without
        // postponed state, which should perform a full dynamic render.
        if (isMinimalMode) {
            isDynamicRSCRequest = isDynamicRSCRequest && hasPostponedState;
        }
        // Need to read this before it's stripped by stripFlightHeaders. We don't
        // need to transfer it to the request meta because it's only read
        // within this function; the static segment data should have already been
        // generated, so we will always either return a static response or a 404.
        const rawSegmentPrefetchHeader = req.headers[_approuterheaders.NEXT_ROUTER_SEGMENT_PREFETCH_HEADER];
        const segmentPrefetchHeader = (0, _requestmeta.getRequestMeta)(req, 'segmentPrefetchRSCRequest') ?? (isPrefetchRSCRequest ? typeof rawSegmentPrefetchHeader === 'string' ? rawSegmentPrefetchHeader : Array.isArray(rawSegmentPrefetchHeader) ? rawSegmentPrefetchHeader[0] : undefined : undefined);
        // TODO: investigate existing bug with shouldServeStreamingMetadata always
        // being true for a revalidate due to modifying the base-server this.renderOpts
        // when fixing this to correct logic it causes hydration issue since we set
        // serveStreamingMetadata to true during export
        const serveStreamingMetadata = !userAgent ? true : (0, _streamingmetadata.shouldServeStreamingMetadata)(userAgent, nextConfig.htmlLimitedBots);
        // A PPR shell has already closed its head before the dynamic render resumes.
        // Blocking metadata resolved during the resume would therefore be emitted
        // after the head, where HTML-limited bots cannot observe it. Bypass the
        // shell so blocking metadata is included in the initial document head.
        const shouldForceDynamicPPRRender = isRoutePPREnabled && !serveStreamingMetadata;
        const isSSG = Boolean((prerenderInfo || isPrerendered || prerenderManifest.routes[normalizedSrcPage]) && !shouldForceDynamicPPRRender);
        // When a page supports cacheComponents, we can support RDC for Navigations
        const supportsRDCForNavigations = isRoutePPREnabled && nextConfig.cacheComponents === true;
        // In development, we always want to generate dynamic HTML.
        const supportsDynamicResponse = // If we're in development, we always support dynamic HTML, unless it's
        // a data request, in which case we only produce static HTML.
        routeModule.isDev === true || // If this is a draft mode request, it supports dynamic HTML.
        isDraftMode || // If this is not SSG or does not have static paths, then it supports
        // dynamic HTML.
        !isSSG || // If this request has provided postponed data, it supports dynamic
        // HTML.
        hasPostponedState || // If this handler supports onCacheEntryV2, then we can only support
        // dynamic responses if it's a dynamic RSC request and not in minimal mode. If it
        // doesn't support it we must fallback to the default behavior.
        (supportsRDCForNavigations && (0, _requestmeta.getRequestMeta)(req, 'onCacheEntryV2') ? // which will generate the RDC for the route. When resuming a Dynamic
        // RSC request, we'll pass the minimal postponed data to the render
        // which will trigger the `supportsDynamicResponse` to be true.
        isDynamicRSCRequest && !isMinimalMode : isDynamicRSCRequest);
        const remainingPrerenderableParams = (prerenderInfo == null ? void 0 : prerenderInfo.remainingPrerenderableParams) ?? [];
        const remainingFallbackRouteParams = nextConfig.cacheComponents ? (prerenderInfo == null ? void 0 : (_prerenderInfo_fallbackRouteParams = prerenderInfo.fallbackRouteParams) == null ? void 0 : _prerenderInfo_fallbackRouteParams.filter((param)=>!remainingPrerenderableParams.some((prerenderableParam)=>prerenderableParam.paramName === param.paramName))) ?? [] : [];
        // Concrete optional routes like `/optional-catchall` can still match their
        // generic shell entry (eg /optional-catchall/[[...slug]]) in the prerender manifest.
        // If the omitted param already resolved to a real prerendered path, keep serving that concrete result.
        const hasOmittedConcreteFallbackParam = isPrerendered && remainingPrerenderableParams.some((param)=>{
            const value = params == null ? void 0 : params[param.paramName];
            return value == null || Array.isArray(value) && value.length === 0;
        });
        const hasUnresolvedRootFallbackParams = (prerenderInfo == null ? void 0 : prerenderInfo.fallback) === null && (((_prerenderInfo_fallbackRootParams = prerenderInfo.fallbackRootParams) == null ? void 0 : _prerenderInfo_fallbackRootParams.length) ?? 0) > 0;
        // SSG writes and navigation RDC reads use the same shell key. Completion
        // uses the matched shell rather than the fully resolved pathname. A request
        // for `/prefix/c/foo` can complete `/prefix/[one]/[two]` to
        // `/prefix/c/[two]`. This avoids creating an entry for every value of
        // `two`.
        //
        // The completed-shell key also applies when unresolved root params require
        // a blocking render. A source shell cannot be shared across root branches.
        // Completion resolves the params into the key as follows:
        // - Root params and other prerenderable params use concrete values.
        // - Never-prerenderable params remain placeholders.
        // The values of those placeholder params must not partition the cache.
        const fallbackPathname = prerenderMatch ? typeof (prerenderInfo == null ? void 0 : prerenderInfo.fallback) === 'string' ? prerenderInfo.fallback : prerenderMatch.source : null;
        let shellCacheKey = null;
        if (nextConfig.cacheComponents && // A closed matcher has no fallback shell. Its generated outputs must
        // retain their concrete cache keys.
        (prerenderInfo == null ? void 0 : prerenderInfo.fallback) !== false && // Never-prerenderable params must stay out of the key even when Partial
        // Prefetching is disabled.
        (nextConfig.partialPrefetching || remainingFallbackRouteParams.length > 0) && fallbackPathname && (prerenderInfo == null ? void 0 : (_prerenderInfo_fallbackRouteParams1 = prerenderInfo.fallbackRouteParams) == null ? void 0 : _prerenderInfo_fallbackRouteParams1.length) && !hasOmittedConcreteFallbackParam) {
            const cacheKey = buildCompletedShellCacheKey(fallbackPathname, remainingPrerenderableParams, params);
            if (cacheKey !== fallbackPathname || remainingFallbackRouteParams.length > 0) {
                shellCacheKey = cacheKey;
            }
        }
        let ssgCacheKey = null;
        let usesShellCacheKey = false;
        if (!isDraftMode && isSSG && !supportsDynamicResponse && !isPossibleServerAction && !hasPostponedState && !isDynamicRSCRequest) {
            if (shellCacheKey !== null) {
                // Normal fallback serving uses the source shell's separate cache
                // lookup. Explicit revalidation skips that path, so it must write the
                // source key here even when no params can be completed.
                if (shellCacheKey !== fallbackPathname || isOnDemandRevalidate) {
                    ssgCacheKey = shellCacheKey;
                    usesShellCacheKey = true;
                }
            } else {
                ssgCacheKey = resolvedPathname;
            }
        }
        // the staticPathKey differs from ssgCacheKey since
        // ssgCacheKey is null in dev since we're always in "dynamic"
        // mode in dev to bypass the cache. It can also be null for partial
        // fallback shells that should remain shared and must not create a
        // param-specific ISR entry, but we still need to honor fallback handling.
        let staticPathKey = ssgCacheKey;
        if (!staticPathKey && (routeModule.isDev || isSSG && pageIsDynamic && (prerenderInfo == null ? void 0 : (_prerenderInfo_fallbackRouteParams2 = prerenderInfo.fallbackRouteParams) == null ? void 0 : _prerenderInfo_fallbackRouteParams2.length) && // Server action requests must not get a staticPathKey, otherwise they
        // enter the fallback rendering block below and return the cached HTML
        // shell with the action result appended, instead of responding with
        // just the RSC action result.
        !isPossibleServerAction)) {
            staticPathKey = resolvedPathname;
        }
        // If this is a request for an app path that should be statically generated
        // and we aren't in the edge runtime, strip the flight headers so it will
        // generate the static response.
        if (!routeModule.isDev && !isDraftMode && isSSG && isRSCRequest && !isDynamicRSCRequest) {
            (0, _stripflightheaders.stripFlightHeaders)(req.headers);
        }
        const ComponentMod = {
            ..._entrybase,
            tree,
            handler,
            routeModule,
            __next_app__
        };
        // Before rendering (which initializes component tree modules), we have to
        // set the reference manifests to our global store so Server Action's
        // encryption util can access to them at the top level of the page module.
        if (serverActionsManifest && clientReferenceManifest) {
            (0, _manifestssingleton.setManifestsSingleton)({
                page: srcPage,
                clientReferenceManifest,
                serverActionsManifest
            });
        }
        const method = req.method || 'GET';
        const tracer = (0, _tracer.getTracer)();
        const render404 = async ()=>{
            // TODO: should route-module itself handle rendering the 404
            if (routerServerContext == null ? void 0 : routerServerContext.render404) {
                await routerServerContext.render404(req, res, parsedUrl, false);
            } else {
                res.statusCode = 404;
                res.end('This page could not be found');
            }
            return null;
        };
        try {
            const varyHeader = routeModule.getVaryHeader(resolvedPathname, interceptionRoutePatterns);
            res.setHeader('Vary', varyHeader);
            const invokeRouteModule = async (span, context, renderOperation)=>{
                const nextReq = new _node.NodeNextRequest(req);
                const nextRes = new _node.NodeNextResponse(res);
                const result = renderOperation === 'prerender' ? routeModule.prerender(nextReq, nextRes, context) : routeModule.render(nextReq, nextRes, context);
                return result.finally(()=>{
                    if (!span) return;
                    span.setAttributes({
                        'http.status_code': res.statusCode,
                        'next.rsc': isRSCRequest
                    });
                    if (res.statusCode && res.statusCode >= 500) {
                        // For 5xx status codes: SHOULD be set to 'Error' span status.
                        // x-ref: https://opentelemetry.io/docs/specs/semconv/http/http-spans/#status
                        span.setStatus({
                            code: _tracer.SpanStatusCode.ERROR
                        });
                        // For span status 'Error', SHOULD set 'error.type' attribute.
                        span.setAttribute('error.type', res.statusCode.toString());
                    }
                    const rootSpanAttributes = tracer.getRootSpanAttributes();
                    // We were unable to get attributes, probably OTEL is not enabled
                    if (!rootSpanAttributes) {
                        return;
                    }
                    if (rootSpanAttributes.get('next.span_type') !== _constants.BaseServerSpan.handleRequest) {
                        console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);
                        return;
                    }
                    const route = rootSpanAttributes.get('next.route') || normalizedSrcPage;
                    const name = isRSCRequest ? `RSC ${method} ${route}` : `${method} ${route}`;
                    span.setAttributes({
                        'next.route': route,
                        'http.route': route,
                        'next.span_name': name
                    });
                    span.updateName(name);
                    // Propagate http.route to the request's root span if it isn't the
                    // request span (e.g. a platform-created HTTP span in adapter
                    // deployments).
                    if (requestRootSpan && requestRootSpan !== span) {
                        requestRootSpan.setAttribute('http.route', route);
                        requestRootSpan.updateName(name);
                    }
                });
            };
            const incrementalCache = (0, _requestmeta.getRequestMeta)(req, 'incrementalCache') || await routeModule.getIncrementalCache(req, nextConfig, previewProps, prerenderManifest, isMinimalMode);
            incrementalCache == null ? void 0 : incrementalCache.resetRequestCache();
            globalThis.__incrementalCache = incrementalCache;
            const doRender = async ({ span, postponed, fallbackRouteParams, renderOperation, allowEmptyStaticShell })=>{
                var _prerenderManifest_dynamicRoutes_normalizedSrcPage, _prerenderManifest_dynamicRoutes_normalizedSrcPage1;
                // A static page may have stripped Flight headers before reaching this
                // render. Parse only when the response cache invokes the render.
                const parsedRequestHeaders = (0, _parserequestheaders.parseRequestHeaders)(req.headers, {
                    isRoutePPREnabled,
                    previewModeId: previewProps == null ? void 0 : previewProps.previewModeId
                });
                const routeMatch = {
                    resolvedPathname
                };
                const dev = (0, _devrendercontext.createDevRenderContext)(req);
                const context = {
                    query,
                    params,
                    page: normalizedSrcPage,
                    routeMatch,
                    parsedRequestHeaders,
                    sharedContext: {
                        buildId,
                        deploymentId,
                        clientAssetToken
                    },
                    dev,
                    fallbackRouteParams,
                    renderOpts: {
                        App: ()=>null,
                        Document: ()=>null,
                        pageConfig: {},
                        ComponentMod,
                        Component: interopDefault(ComponentMod),
                        params,
                        routeModule,
                        page: srcPage,
                        postponed,
                        allowEmptyStaticShell,
                        serveStreamingMetadata,
                        supportsDynamicResponse: renderOperation === 'render' && (typeof postponed === 'string' || supportsDynamicResponse),
                        buildManifest,
                        nextFontManifest,
                        reactLoadableManifest,
                        subresourceIntegrityManifest,
                        setCacheStatus: routerServerContext == null ? void 0 : routerServerContext.setCacheStatus,
                        setIsrStatus: routerServerContext == null ? void 0 : routerServerContext.setIsrStatus,
                        setReactDebugChannel: routerServerContext == null ? void 0 : routerServerContext.setReactDebugChannel,
                        sendErrorsToBrowser: routerServerContext == null ? void 0 : routerServerContext.sendErrorsToBrowser,
                        dir: process.env.NEXT_RUNTIME === 'nodejs' ? require('path').join(/* turbopackIgnore: true */ process.cwd(), routeModule.relativeProjectDir) : `${process.cwd()}/${routeModule.relativeProjectDir}`,
                        isDraftMode,
                        botType,
                        isOnDemandRevalidate,
                        isPossibleServerAction,
                        assetPrefix: routeModule.getAssetPrefixForRender(routerServerContext, nextConfig.assetPrefix),
                        nextConfigOutput: nextConfig.output,
                        crossOrigin: nextConfig.crossOrigin,
                        trailingSlash: nextConfig.trailingSlash,
                        images: nextConfig.images,
                        previewProps,
                        enableTainting: nextConfig.experimental.taint,
                        reactMaxHeadersLength: nextConfig.reactMaxHeadersLength,
                        multiZoneDraftMode,
                        prefetchHints: prefetchHintsManifest,
                        // With dynamicParams = false, every parameter is restricted to the
                        // paths generated at build time. Advertise this even for allowed
                        // URLs. Read the current manifest here because dev updates it as
                        // routes compile.
                        notFoundParams: (routeModule.isDev ? (0, _requestmeta.getRequestMeta)(req, 'devNotFoundParams') : undefined) ?? ((_prerenderManifest_dynamicRoutes_normalizedSrcPage = prerenderManifest.dynamicRoutes[normalizedSrcPage]) == null ? void 0 : _prerenderManifest_dynamicRoutes_normalizedSrcPage.notFoundParams) ?? (((_prerenderManifest_dynamicRoutes_normalizedSrcPage1 = prerenderManifest.dynamicRoutes[normalizedSrcPage]) == null ? void 0 : _prerenderManifest_dynamicRoutes_normalizedSrcPage1.fallback) === false ? routeParamNames : undefined),
                        incrementalCache,
                        cacheLifeProfiles: nextConfig.cacheLife,
                        staticPageGenerationTimeout: nextConfig.staticPageGenerationTimeout,
                        basePath: nextConfig.basePath,
                        serverActions: nextConfig.experimental.serverActions,
                        logServerFunctions: typeof nextConfig.logging === 'object' && Boolean(nextConfig.logging.serverFunctions),
                        ...isDebugStaticShell || isDebugDynamicAccesses || isDebugFallbackShell ? {
                            isBuildTimePrerendering: true,
                            isDebugDynamicAccesses: isDebugDynamicAccesses
                        } : {},
                        cacheComponents: Boolean(nextConfig.cacheComponents),
                        partialPrefetching: nextConfig.partialPrefetching,
                        // A fallback shell can only be upgraded to a concrete version if at
                        // least one of its fallback params is a `generateStaticParams`
                        // candidate (`remainingPrerenderableParams`), and only when Partial
                        // Prefetching is enabled (the upgrade itself is gated on it above).
                        // This gates whether the per-segment prefetch responses are flagged
                        // `isUpgradeableISRFallback`; without an upgrade to wait for, the
                        // client should not retry the prefetch.
                        isFallbackUpgradeable: Boolean(nextConfig.partialPrefetching) && remainingPrerenderableParams.length > 0,
                        validationLevel: nextConfig.experimental.instantInsights.validationLevel,
                        experimental: {
                            isRoutePPREnabled,
                            expireTime: nextConfig.expireTime,
                            staleTimes: nextConfig.experimental.staleTimes,
                            dynamicOnHover: Boolean(nextConfig.experimental.dynamicOnHover),
                            optimisticRouting: Boolean(nextConfig.experimental.optimisticRouting),
                            parallelRouteMetadata: Boolean(nextConfig.experimental.parallelRouteMetadata),
                            inlineCss: Boolean(nextConfig.experimental.inlineCss),
                            prefetchInlining: nextConfig.experimental.prefetchInlining ?? false,
                            authInterrupts: Boolean(nextConfig.experimental.authInterrupts),
                            reactBrowserBailout: Boolean(nextConfig.experimental.reactBrowserBailout),
                            serverComponentsHmrCancellation: Boolean(nextConfig.experimental.serverComponentsHmrCancellation),
                            useCacheTimeout: nextConfig.experimental.useCacheTimeout,
                            durableUseCacheEntries: Boolean(nextConfig.experimental.durableUseCacheEntries),
                            cachedNavigations: nextConfig.experimental.cachedNavigations ?? false,
                            clientTraceMetadata: nextConfig.experimental.clientTraceMetadata || [],
                            clientParamParsingOrigins: nextConfig.experimental.clientParamParsingOrigins,
                            maxPostponedStateSizeBytes: (0, _sizelimit.parseMaxPostponedStateSize)(nextConfig.experimental.maxPostponedStateSize),
                            disableResumeDataCacheCompression: nextConfig.experimental.disableResumeDataCacheCompression ?? false,
                            exposeTestingApi
                        },
                        waitUntil: ctx.waitUntil,
                        onClose: (cb)=>{
                            res.on('close', cb);
                        },
                        onAfterTaskError: ()=>{},
                        onInstrumentationRequestError: (error, errorContext, silenceLog)=>routeModule.onRequestError(req, error, errorContext, silenceLog, routerServerContext),
                        err: (0, _requestmeta.getRequestMeta)(req, 'invokeError')
                    }
                };
                const result = await invokeRouteModule(span, context, renderOperation);
                // Keep recovery output separate from successful response cache entries.
                if ('error' in result) {
                    ;
                    req.fetchMetrics = result.result.metadata.fetchMetrics;
                    return result;
                }
                const { metadata } = result;
                const { cacheControl, headers = {}, // Add any fetch tags that were on the page to the response headers.
                fetchTags: cacheTags, fetchMetrics } = metadata;
                // Apply the `expireTime` fallback as soon as we have the render's
                // `cacheControl`, so every downstream consumer (the cache stored via
                // `incrementalCache.set`, the response Cache-Control header, the outgoing
                // entry returned to `handleResponse`) sees a finalized `cacheControl`
                // with a populated `expire`. This mirrors the build-time fallback in
                // `build/index.ts` so we don't apply an expire to routes that opt out of
                // revalidation entirely (`revalidate: false`) or that are dynamic
                // (`revalidate: 0`).
                if (cacheControl && cacheControl.revalidate !== false && cacheControl.revalidate > 0 && cacheControl.expire === undefined) {
                    cacheControl.expire = nextConfig.expireTime;
                }
                if (cacheTags) {
                    headers[_constants1.NEXT_CACHE_TAGS_HEADER] = cacheTags;
                }
                // Pull any fetch metrics from the render onto the request.
                ;
                req.fetchMetrics = fetchMetrics;
                // we don't throw static to dynamic errors in dev as isSSG
                // is a best guess in dev since we don't have the prerender pass
                // to know whether the path is actually static or not
                if (isSSG && (cacheControl == null ? void 0 : cacheControl.revalidate) === 0 && !routeModule.isDev && !isRoutePPREnabled) {
                    const staticBailoutInfo = metadata.staticBailoutInfo;
                    const err = new Error(`Page changed from static to dynamic at runtime ${resolvedPathname}${(staticBailoutInfo == null ? void 0 : staticBailoutInfo.description) ? `, reason: ${staticBailoutInfo.description}` : ``}` + `\nsee more here https://nextjs.org/docs/messages/app-static-to-dynamic-error`);
                    if (staticBailoutInfo == null ? void 0 : staticBailoutInfo.stack) {
                        const stack = staticBailoutInfo.stack;
                        err.stack = err.message + stack.substring(stack.indexOf('\n'));
                    }
                    throw err;
                }
                return {
                    value: {
                        kind: _responsecache.CachedRouteKind.APP_PAGE,
                        html: result,
                        headers,
                        rscData: metadata.flightData,
                        postponed: metadata.postponed,
                        status: metadata.statusCode,
                        segmentData: metadata.segmentData
                    },
                    cacheControl
                };
            };
            const responseGenerator = async ({ hasResolved, previousCacheEntry: previousIncrementalCacheEntry, isRevalidating, span, forceStaticRender = false })=>{
                const isProduction = routeModule.isDev === false;
                const didRespond = hasResolved || res.writableEnded;
                const reportRevalidationError = (error)=>routeModule.onRequestError(req, error, {
                        routerKind: 'App Router',
                        routePath: srcPage,
                        routeType: 'render',
                        revalidateReason: (0, _utils.getRevalidateReason)({
                            isStaticGeneration: isSSG,
                            isOnDemandRevalidate
                        })
                    }, false, routerServerContext);
                try {
                    var _prerenderInfo_fallbackRouteParams;
                    // skip on-demand revalidate if cache is not present and
                    // revalidate-if-generated is set
                    if (isOnDemandRevalidate && revalidateOnlyGenerated && !previousIncrementalCacheEntry && !isMinimalMode) {
                        if (routerServerContext == null ? void 0 : routerServerContext.render404) {
                            await routerServerContext.render404(req, res);
                        } else {
                            res.statusCode = 404;
                            res.end('This page could not be found');
                        }
                        return null;
                    }
                    let fallbackMode;
                    if (prerenderInfo) {
                        fallbackMode = (0, _fallback.parseFallbackField)(prerenderInfo.fallback);
                    }
                    // A closed matcher rejects new paths, not regeneration of paths that
                    // were produced by the build. Their cache entries can be invalidated
                    // or evicted without removing the path from the build manifest.
                    if (fallbackMode === _fallback.FallbackMode.NOT_FOUND && isPrerendered) {
                        fallbackMode = _fallback.FallbackMode.BLOCKING_STATIC_RENDER;
                    }
                    if (nextConfig.partialPrefetching && (prerenderInfo == null ? void 0 : prerenderInfo.fallback) === null && // TODO(ensure-static): express this in a cleaner way
                    !isEnsureStaticPage && !prerenderInfo.isExplicitlyBlocking && !hasOmittedConcreteFallbackParam && !hasUnresolvedRootFallbackParams && remainingPrerenderableParams.length > 0) {
                        // Generic source shells without unresolved root params don't have a
                        // concrete fallback file of their own, so they're marked as blocking.
                        // When we can complete the shell into a more specific
                        // prerendered shell for this request, treat it like a prerender
                        // fallback so we can serve that shell instead of blocking on the full
                        // route. Root-param shells stay blocking, since unknown root branches
                        // should not inherit a shell from another generated branch.
                        fallbackMode = _fallback.FallbackMode.PRERENDER;
                    }
                    // When serving a request that requires blocking metadata, we want to
                    // use a blocking render instead of the prerendered fallback. Without
                    // PPR, preserve the existing behavior for built-in bots.
                    if (fallbackMode === _fallback.FallbackMode.PRERENDER && (isRoutePPREnabled ? !serveStreamingMetadata : Boolean(botType))) {
                        fallbackMode = _fallback.FallbackMode.BLOCKING_STATIC_RENDER;
                    }
                    if ((previousIncrementalCacheEntry == null ? void 0 : previousIncrementalCacheEntry.isStale) === -1) {
                        isOnDemandRevalidate = true;
                    }
                    // On-demand revalidation blocks for admitted paths. Cache contents
                    // must not make an otherwise closed path eligible for generation.
                    if (isOnDemandRevalidate && fallbackMode !== _fallback.FallbackMode.NOT_FOUND) {
                        fallbackMode = _fallback.FallbackMode.BLOCKING_STATIC_RENDER;
                    }
                    if (// Ordinary dev requests always use the request-specific render
                    // below. Only production, forced background work, and explicit
                    // shell debugging may enter fallback prerender handling.
                    (isProduction || forceStaticRender || isDebugPrerender) && !isMinimalMode && fallbackMode !== _fallback.FallbackMode.BLOCKING_STATIC_RENDER && staticPathKey && !didRespond && !isDraftMode && pageIsDynamic && (isProduction || !isPrerendered)) {
                        // When cacheComponents is enabled, we can use the fallback
                        // response if the request is not a dynamic RSC request because the
                        // RSC data when this feature flag is enabled does not contain any
                        // param references. Without this feature flag enabled, the RSC data
                        // contains param references, and therefore we can't use the fallback.
                        if (isRoutePPREnabled && (nextConfig.cacheComponents ? !isDynamicRSCRequest : !isRSCRequest)) {
                            const cacheKey = isProduction && typeof (prerenderInfo == null ? void 0 : prerenderInfo.fallback) === 'string' ? prerenderInfo.fallback : normalizedSrcPage;
                            let fallbackRouteParams;
                            if (isProduction) {
                                // In production, rely on the prerender manifest's fallback
                                // entry — the authoritative set computed at build time by
                                // `buildAppStaticPaths`.
                                if (prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams) {
                                    fallbackRouteParams = (0, _fallbackparams.createOpaqueFallbackRouteParams)(prerenderInfo.fallbackRouteParams);
                                } else if (isDebugFallbackShell) {
                                    fallbackRouteParams = (0, _fallbackparams.getFallbackRouteParams)(normalizedSrcPage, routeModule);
                                } else {
                                    fallbackRouteParams = null;
                                }
                            } else {
                                // Dev selects the source for static-shell debug renders from
                                // the per-URL `getStaticPaths` result. The dev prerender
                                // manifest does not contain these ad-hoc paths. `base-server`
                                // passes the source's fallback params in request metadata.
                                // These renders need the source set, not the completed target's
                                // potentially smaller `stagedFallbackParams`.
                                if (isDebugFallbackShell) {
                                    fallbackRouteParams = (0, _fallbackparams.getFallbackRouteParams)(normalizedSrcPage, routeModule);
                                } else if (isDebugStaticShell) {
                                    fallbackRouteParams = (0, _requestmeta.getRequestMeta)(req, 'fallbackRouteParams') ?? null;
                                } else {
                                    fallbackRouteParams = null;
                                }
                            }
                            // Debug rendering stages the params of the selected source shell.
                            if (isDebugStaticShell) {
                                (0, _requestmeta.addRequestMeta)(req, 'stagedFallbackParams', fallbackRouteParams);
                            }
                            // We use the response cache here to handle the revalidation and
                            // management of the fallback shell.
                            const fallbackResponse = await routeModule.handleResponse({
                                cacheKey,
                                req,
                                nextConfig,
                                routeKind: _routekind.RouteKind.APP_PAGE,
                                isFallback: true,
                                previewProps,
                                prerenderManifest,
                                isRoutePPREnabled,
                                responseGenerator: async ()=>doRender({
                                        span,
                                        // We pass `undefined` as rendering a fallback isn't resumed
                                        // here.
                                        postponed: undefined,
                                        // Always serve the shell that matched this request
                                        // immediately. If there are still prerenderable params left,
                                        // the background path below will complete the shell into a
                                        // more specific cache entry for later requests.
                                        fallbackRouteParams,
                                        renderOperation: 'prerender',
                                        allowEmptyStaticShell: isInstantNavigationTest || undefined
                                    }),
                                waitUntil: ctx.waitUntil,
                                isMinimalMode
                            });
                            if (fallbackResponse === null || 'error' in fallbackResponse) {
                                return fallbackResponse;
                            }
                            // Otherwise, if we did get a fallback response, we should return it.
                            if (fallbackResponse) {
                                if (!isMinimalMode && isRoutePPREnabled && // Upgrading a fallback shell into a more specific ISR entry is
                                // only done when Partial Prefetching is enabled, mirroring the
                                // `partialFallback` flag the adapter emits for deployments.
                                nextConfig.partialPrefetching && // Match the build-time contract: only fallback shells that can
                                // still be completed with prerenderable params should upgrade.
                                remainingPrerenderableParams.length > 0 && ssgCacheKey && incrementalCache && !isOnDemandRevalidate && !isDebugFallbackShell && // The testing API relies on deterministic shell behavior, so
                                // don't upgrade fallback shells in the background when it's
                                // exposed.
                                !exposeTestingApi && // Instant Navigation Testing API requests intentionally keep
                                // the route in shell mode; don't upgrade these in background.
                                !isInstantNavigationTest) {
                                    (0, _scheduler.scheduleOnNextTick)(async ()=>{
                                        const responseCache = routeModule.getResponseCache(req);
                                        try {
                                            // Only the params that were just specialized should be
                                            // removed from the fallback render. Any remaining fallback
                                            // params stay deferred so the revalidated result is a more
                                            // specific shell (e.g. `/prefix/c/[two]`), not a fully
                                            // concrete route (`/prefix/c/foo`).
                                            const result = await responseCache.revalidate(ssgCacheKey, incrementalCache, isRoutePPREnabled, false, (c)=>{
                                                return doRender({
                                                    span: c.span,
                                                    postponed: undefined,
                                                    fallbackRouteParams: remainingFallbackRouteParams.length > 0 ? (0, _fallbackparams.createOpaqueFallbackRouteParams)(remainingFallbackRouteParams) : null,
                                                    renderOperation: 'prerender'
                                                });
                                            }, // We don't have a prior entry for this param-specific shell.
                                            null, hasResolved, ctx.waitUntil);
                                            if (result !== null && 'error' in result) {
                                                throw result.error;
                                            }
                                        } catch (err) {
                                            console.error('Error revalidating the page in the background', err);
                                        }
                                    });
                                }
                                // Remove the cache control from the response to prevent it from being
                                // used in the surrounding cache.
                                delete fallbackResponse.cacheControl;
                                return fallbackResponse;
                            }
                        }
                    }
                    // Only requests that aren't revalidating can be resumed. If we have the
                    // minimal postponed data, then we should resume the render with it.
                    let postponed = !isOnDemandRevalidate && !isRevalidating && minimalPostponed ? minimalPostponed : undefined;
                    let hasFullyStaticCacheEntry = false;
                    if (// If this is a dynamic RSC request or a server action request, we should
                    // use the postponed data from the static render (if available). This
                    // ensures that we can utilize the resume data cache (RDC) from the static
                    // render to ensure that the data is consistent between the static and
                    // dynamic renders (for navigations) or when re-rendering after a server
                    // action.
                    // Only enable RDC for Navigations if the feature is enabled.
                    supportsRDCForNavigations && process.env.NEXT_RUNTIME !== 'edge' && !isMinimalMode && incrementalCache && // Include both dynamic RSC requests (navigations) and server actions
                    (isDynamicRSCRequest || isPossibleServerAction) && // We don't typically trigger an on-demand revalidation for dynamic RSC
                    // requests, as we're typically revalidating the page in the background
                    // instead. However, if the cache entry is stale, we should trigger a
                    // background revalidation on dynamic RSC requests. This prevents us
                    // from entering an infinite loop of revalidations.
                    !forceStaticRender) {
                        const incrementalCacheKey = shellCacheKey ?? resolvedPathname;
                        const incrementalCacheEntry = await incrementalCache.get(incrementalCacheKey, {
                            kind: _responsecache.IncrementalCacheKind.APP_PAGE,
                            route: routeModule.cacheOwner,
                            isRoutePPREnabled: true,
                            isFallback: false
                        });
                        // If the cache entry is found, we should use the postponed data from
                        // the cache.
                        if (incrementalCacheEntry && incrementalCacheEntry.value && incrementalCacheEntry.value.kind === _responsecache.CachedRouteKind.APP_PAGE) {
                            // CRITICAL: we're assigning the postponed data from the cache entry
                            // here as we're using the RDC to resume the render.
                            postponed = incrementalCacheEntry.value.postponed;
                            hasFullyStaticCacheEntry = postponed === undefined;
                            // If the cache entry is stale, we should trigger a background
                            // revalidation so that subsequent requests will get a fresh response.
                            if (incrementalCacheEntry && // We want to trigger this flow if the cache entry is stale and if
                            // the requested revalidation flow is either foreground or
                            // background.
                            (incrementalCacheEntry.isStale === -1 || incrementalCacheEntry.isStale === true)) {
                                // We want to schedule this on the next tick to ensure that the
                                // render is not blocked on it.
                                (0, _scheduler.scheduleOnNextTick)(async ()=>{
                                    const responseCache = routeModule.getResponseCache(req);
                                    try {
                                        const result = await responseCache.revalidate(incrementalCacheKey, incrementalCache, isRoutePPREnabled, false, (c)=>responseGenerator({
                                                ...c,
                                                // CRITICAL: we need to set this to true as we're
                                                // revalidating in the background and typically this dynamic
                                                // RSC request is not treated as static.
                                                forceStaticRender: true
                                            }), // CRITICAL: we need to pass null here because passing the
                                        // previous cache entry here (which is stale) will switch on
                                        // isOnDemandRevalidate and break the prerendering.
                                        null, hasResolved, ctx.waitUntil);
                                        if (result !== null && 'error' in result) {
                                            throw result.error;
                                        }
                                    } catch (err) {
                                        console.error('Error revalidating the page in the background', err);
                                    }
                                });
                            }
                        }
                    }
                    // When we're in minimal mode, if we're trying to debug the static shell,
                    // return an empty App Page response instead of resuming the dynamic
                    // render. The static shell has already been streamed by the platform.
                    if ((isDebugStaticShell || isDebugDynamicAccesses) && typeof postponed !== 'undefined') {
                        return {
                            cacheControl: {
                                revalidate: 1,
                                expire: undefined
                            },
                            value: {
                                kind: _responsecache.CachedRouteKind.APP_PAGE,
                                html: _renderresult.default.fromStatic('', isRSCRequest ? _approuterheaders.RSC_CONTENT_TYPE_HEADER : _constants1.HTML_CONTENT_TYPE_HEADER),
                                rscData: undefined,
                                postponed,
                                segmentData: undefined,
                                headers: undefined,
                                status: undefined
                            }
                        };
                    }
                    const placeholderFallbackRouteParams = // In minimal mode, the platform injects dynamic placeholder values
                    // (e.g. "[slug]") for the params it leaves unresolved, so defer
                    // only that subset instead of forcing all fallback params to
                    // suspend. With `next start`, a placeholder-shaped segment in the
                    // URL is an ordinary concrete value, and every never-prerenderable
                    // param defers below.
                    isMinimalMode && !routeModule.isDev && pageIsDynamic && (prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams) ? (0, _fallbackparams.getPlaceholderFallbackRouteParams)(params, prerenderInfo.fallbackRouteParams) : null;
                    const fallbackRouteParamsForRender = placeholderFallbackRouteParams && placeholderFallbackRouteParams.length > 0 ? placeholderFallbackRouteParams : prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams;
                    const hasPlaceholderFallbackRouteParams = placeholderFallbackRouteParams != null && placeholderFallbackRouteParams.length > 0;
                    // When route-module.ts resolved partial nxtP* params during
                    // background revalidation, filter fallbackRouteParams to only the
                    // params that are still unresolved. This lets doRender produce an
                    // intermediate PPR shell that suspends only for those params.
                    let effectiveFallbackRouteParams = null;
                    if (nextConfig.cacheComponents && (prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams)) {
                        const resolvedKeys = (0, _requestmeta.getRequestMeta)(req, 'resolvedRouteParamKeys');
                        if (resolvedKeys && resolvedKeys.size > 0) {
                            effectiveFallbackRouteParams = prerenderInfo.fallbackRouteParams.filter((param)=>!resolvedKeys.has(param.paramName));
                        }
                    }
                    const fallbackRouteParams = // In production or when debugging the static shell for a
                    // non-prerendered URL, use the prerender manifest's fallback route
                    // params which correctly identifies which params are unknown.
                    (isProduction && (0, _requestmeta.getRequestMeta)(req, 'renderFallbackShell') || hasPlaceholderFallbackRouteParams || isDebugStaticShell && !isPrerendered) && fallbackRouteParamsForRender ? (0, _fallbackparams.createOpaqueFallbackRouteParams)(fallbackRouteParamsForRender) : // others still have placeholders, use the filtered subset so the
                    // prerender suspends only for the unresolved params.
                    effectiveFallbackRouteParams && effectiveFallbackRouteParams.length > 0 && effectiveFallbackRouteParams.length < ((prerenderInfo == null ? void 0 : (_prerenderInfo_fallbackRouteParams = prerenderInfo.fallbackRouteParams) == null ? void 0 : _prerenderInfo_fallbackRouteParams.length) ?? 0) ? (0, _fallbackparams.createOpaqueFallbackRouteParams)(effectiveFallbackRouteParams) : // The render must not store their concrete values in the
                    // shared entry. Per-request resumes resolve those params
                    // instead. Blocking renders and RSC-triggered revalidations
                    // both need this restriction.
                    //
                    // The serving modes obtain the unresolved params differently:
                    // - `next start` defers them in this branch.
                    // - Minimal mode uses the platform's placeholders above.
                    // The platform strips never-prerenderable param values before
                    // calling the origin.
                    !isMinimalMode && (usesShellCacheKey || forceStaticRender && shellCacheKey !== null) && remainingFallbackRouteParams.length > 0 ? (0, _fallbackparams.createOpaqueFallbackRouteParams)(remainingFallbackRouteParams) : isDebugFallbackShell ? (0, _fallbackparams.getFallbackRouteParams)(normalizedSrcPage, routeModule) : null;
                    // Staging defers params without replacing their values with opaque
                    // placeholders. A resumed render reads the selected artifact's mask
                    // from its postponed state.
                    if ((isProduction || isDebugStaticShell) && nextConfig.cacheComponents) {
                        let stagedFallbackParams;
                        if (hasPlaceholderFallbackRouteParams) {
                            stagedFallbackParams = (0, _fallbackparams.createOpaqueFallbackRouteParams)(placeholderFallbackRouteParams);
                        } else if (isDebugStaticShell) {
                            stagedFallbackParams = fallbackRouteParams;
                        } else if (hasFullyStaticCacheEntry || isPrerendered) {
                            stagedFallbackParams = null;
                        } else if (postponed && (prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams)) {
                            // App-render uses this source-shell set only when the supplied
                            // state does not record its own fallback params.
                            stagedFallbackParams = (0, _fallbackparams.createOpaqueFallbackRouteParams)(prerenderInfo.fallbackRouteParams);
                        } else if (prerenderInfo) {
                            stagedFallbackParams = (0, _fallbackparams.getStagedFallbackParams)(prerenderInfo);
                        } else {
                            stagedFallbackParams = null;
                        }
                        (0, _requestmeta.addRequestMeta)(req, 'stagedFallbackParams', stagedFallbackParams);
                    }
                    // Forced static and debug renders are prerenders even when the
                    // surrounding request otherwise supports dynamic rendering.
                    const isRequestSpecificRender = !forceStaticRender && !isDebugPrerender && (supportsDynamicResponse || isPossibleServerAction);
                    // Perform the render.
                    const result = await doRender({
                        span,
                        postponed,
                        fallbackRouteParams,
                        renderOperation: isRequestSpecificRender ? 'render' : 'prerender',
                        allowEmptyStaticShell: isInstantNavigationTest || undefined
                    });
                    // The response cache already served the stale entry, so response
                    // delivery cannot report this background failure.
                    if ('error' in result && hasResolved) {
                        await reportRevalidationError(result.error);
                    }
                    return result;
                } catch (err) {
                    // The foreground handler reports errors while it awaits a response.
                    // Report here only after the cache has resolved that response.
                    if (hasResolved) {
                        await reportRevalidationError(err);
                    }
                    throw err;
                }
            };
            const invokeOnCacheEntry = (cacheEntry)=>{
                var _parseUrl;
                // If we support RDC for Navigations, prefer the callback that can
                // deliver postponed state for both document and RSC requests.
                const onCacheEntry = supportsRDCForNavigations ? (0, _requestmeta.getRequestMeta)(req, 'onCacheEntryV2') ?? (0, _requestmeta.getRequestMeta)(req, 'onCacheEntry') : (0, _requestmeta.getRequestMeta)(req, 'onCacheEntry');
                if (!onCacheEntry) {
                    return false;
                }
                const rawCacheEntryUrl = (0, _requestmeta.getRequestMeta)(req, 'initURL') ?? req.url;
                const cacheEntryUrl = rawCacheEntryUrl ? ((_parseUrl = (0, _url.parseUrl)(rawCacheEntryUrl)) == null ? void 0 : _parseUrl.pathname) ?? rawCacheEntryUrl : undefined;
                return onCacheEntry(cacheEntry, {
                    url: cacheEntryUrl
                });
            };
            const resumeRender = (body, postponed, span)=>{
                // Attach the continuation before rendering so the prelude can start
                // streaming immediately.
                const transformer = new TransformStream();
                body.push(transformer.readable);
                // This metadata supplies fallback params when the saved state does not
                // record them. App-render uses the saved state's own set when present.
                if (nextConfig.cacheComponents && (prerenderInfo == null ? void 0 : prerenderInfo.fallbackRouteParams)) {
                    (0, _requestmeta.addRequestMeta)(req, 'stagedFallbackParams', (0, _fallbackparams.createOpaqueFallbackRouteParams)(prerenderInfo.fallbackRouteParams));
                }
                // Start the resume without awaiting it. The response consumes the
                // continuation stream attached above.
                doRender({
                    span,
                    postponed,
                    // The resume retains concrete param values; staging only defers
                    // access.
                    fallbackRouteParams: null,
                    renderOperation: 'render'
                }).then(async (result)=>{
                    var _result_value;
                    if (!result) {
                        throw new Error('Invariant: expected a result to be returned');
                    }
                    if ('error' in result) {
                        throw result.error;
                    }
                    if (((_result_value = result.value) == null ? void 0 : _result_value.kind) !== _responsecache.CachedRouteKind.APP_PAGE) {
                        var _result_value1;
                        throw new Error(`Invariant: expected a page response, got ${(_result_value1 = result.value) == null ? void 0 : _result_value1.kind}`);
                    }
                    // Pipe the resume result to the transformer.
                    await result.value.html.pipeTo(transformer.writable);
                }).catch((err)=>{
                    // An error occurred during piping or preparing the render, abort
                    // the transformers writer so we can terminate the stream.
                    transformer.writable.abort(err).catch((e)=>{
                        console.error("couldn't abort transformer", e);
                    });
                });
            };
            const handleResponse = async (span)=>{
                var _cacheEntry_value, _cachedData_headers;
                // Development evaluates the configured policy without emitting its
                // production matchers. Use that outcome at the same admission boundary.
                const devParamMatchingRejected = routeModule.isDev && !isDebugPrerender && (0, _requestmeta.getRequestMeta)(req, 'devParamMatchingRejected');
                // Decide whether this URL is allowed before consulting ISR. An exact
                // build path remains valid even when its cached result is missing, and
                // the most specific matched route controls whether other paths may be
                // generated. Neither a cache hit nor revalidation changes that decision.
                // Server Actions may be forwarded to a worker's route pattern rather
                // than a concrete URL. That invokes the action, not a page navigation.
                if (!isMinimalMode && !isDraftMode && !isPossibleServerAction && pageIsDynamic && (devParamMatchingRejected || (prerenderInfo == null ? void 0 : prerenderInfo.fallback) === false && !isPrerendered)) {
                    if (nextConfig.adapterPath) {
                        return await render404();
                    }
                    throw new _nofallbackerrorexternal.NoFallbackError();
                }
                const cacheEntry = await routeModule.handleResponse({
                    cacheKey: ssgCacheKey,
                    responseGenerator: (c)=>responseGenerator({
                            span,
                            ...c
                        }),
                    routeKind: _routekind.RouteKind.APP_PAGE,
                    isOnDemandRevalidate,
                    isRoutePPREnabled,
                    req,
                    nextConfig,
                    previewProps,
                    prerenderManifest,
                    waitUntil: ctx.waitUntil,
                    isMinimalMode
                });
                if (cacheEntry !== null && 'error' in cacheEntry) {
                    if (res.headersSent || res.writableEnded) {
                        // The outer catch reports the error when we cannot send recovery.
                        throw cacheEntry.error;
                    }
                    // Returned failures bypass the outer catch's error reporting. Do not
                    // await async reporting before sending the error response.
                    const reportPrerenderError = ()=>{
                        const errorReporting = routeModule.onRequestError(req, cacheEntry.error, {
                            routerKind: 'App Router',
                            routePath: srcPage,
                            routeType: 'render',
                            revalidateReason: (0, _utils.getRevalidateReason)({
                                isStaticGeneration: isSSG,
                                isOnDemandRevalidate
                            })
                        }, false, routerServerContext).catch((err)=>{
                            console.error(err);
                        });
                        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, errorReporting);
                    };
                    const { result } = cacheEntry;
                    for (const [name, value] of Object.entries(result.metadata.headers ?? {})){
                        if (value !== undefined) {
                            res.appendHeader(name, typeof value === 'number' ? value.toString() : value);
                        }
                    }
                    // Each request needs the failure status, including callers that
                    // reused another request's render through the response cache.
                    res.statusCode = 500;
                    span == null ? void 0 : span.setAttributes({
                        'http.status_code': 500,
                        'next.rsc': isRSCRequest,
                        'error.type': '500'
                    });
                    span == null ? void 0 : span.setStatus({
                        code: _tracer.SpanStatusCode.ERROR
                    });
                    res.removeHeader('x-nextjs-cache');
                    res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
                    let response = result;
                    if (isRSCRequest) {
                        // The router discards failed prefetches and falls back to a
                        // document load when navigation receives a failed Flight response.
                        response = _renderresult.default.fromStatic('', _approuterheaders.RSC_CONTENT_TYPE_HEADER);
                    } else if (typeof result.metadata.postponed === 'string') {
                        // The platform needs the postponed state to resume with the actual
                        // request. This value is only for delivery; the response cache
                        // retains the failure and never persists it as ISR output.
                        //
                        // The callback writes to res without applying value.status. Its
                        // status and metadata headers must be set first.
                        if (await invokeOnCacheEntry({
                            value: {
                                kind: _responsecache.CachedRouteKind.APP_PAGE,
                                html: result,
                                rscData: result.metadata.flightData,
                                postponed: result.metadata.postponed,
                                status: 500,
                                headers: undefined,
                                segmentData: undefined
                            },
                            cacheControl: {
                                revalidate: 0,
                                expire: undefined
                            }
                        })) {
                            reportPrerenderError();
                            return null;
                        }
                        if (isMinimalMode) {
                            // A prerender invocation may have filtered request headers, so
                            // only the platform can resume with the original request.
                            //
                            // Let the outer catch report this error once.
                            throw cacheEntry.error;
                        }
                        // Each request owns its continuation. The buffered prelude and
                        // postponed state can be shared by the response cache.
                        response = _renderresult.default.fromStatic(result.toUnchunkedString(), _constants1.HTML_CONTENT_TYPE_HEADER);
                        resumeRender(response, result.metadata.postponed, span);
                    }
                    reportPrerenderError();
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        result: response,
                        generateEtags: false,
                        poweredByHeader: nextConfig.poweredByHeader,
                        cacheControl: undefined
                    });
                }
                if (isDraftMode) {
                    res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
                }
                // Documents and RSC payloads must not be stored in development.
                // Browsers reuse a stored response for a history navigation without
                // revalidating it, so a back navigation would restore a page from
                // before the latest edit. Static assets never reach this code. They
                // keep a revalidatable `Cache-Control`, so the browser caches them
                // between page loads.
                if (routeModule.isDev) {
                    res.setHeader('Cache-Control', 'no-store');
                }
                if (!cacheEntry) {
                    if (ssgCacheKey) {
                        // A cache entry might not be generated if a response is written
                        // in `getInitialProps` or `getServerSideProps`, but those shouldn't
                        // have a cache key. If we do have a cache key but we don't end up
                        // with a cache entry, then either Next.js or the application has a
                        // bug that needs fixing.
                        throw new Error('invariant: cache entry required but not generated');
                    }
                    return null;
                }
                if (((_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== _responsecache.CachedRouteKind.APP_PAGE) {
                    var _cacheEntry_value1;
                    throw new Error(`Invariant app-page handler received invalid cache entry ${(_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`);
                }
                const didPostpone = typeof cacheEntry.value.postponed === 'string';
                // A static shell with postponed parts doesn't include the Turbopack
                // bootstrap: the resume emits it with the request's CSP nonce. When
                // such a shell is served without a resume, it has to be added.
                const pushTurbopackBootstrapScript = (result)=>{
                    if (!didPostpone) return;
                    const bootstrapScript = (0, _turbopackbootstrapscript.createTurbopackBootstrapScriptStreamForPage)(buildManifest, srcPage, (0, _getscriptnoncefromheader.getScriptNonceFromHeaders)(req.headers));
                    if (bootstrapScript) result.push(bootstrapScript);
                };
                // Set the build ID header for RSC navigation requests when deploymentId is configured. This
                // corresponds with maybeAppendBuildIdToRSCPayload in app-render.tsx which omits the build ID
                // from the RSC payload when deploymentId is set (relying on this header instead). Server
                // actions are excluded here because action redirect responses get the deployment ID header
                // from the pre-fetched redirect target (via createRedirectRenderResult in action-handler.ts
                // which copies headers from the internal RSC fetch).
                // For static prerenders served from CDN, routes-manifest.json adds a header.
                if (isRSCRequest && !isPossibleServerAction && deploymentId) {
                    res.setHeader(_constants1.NEXT_NAV_DEPLOYMENT_ID_HEADER, deploymentId);
                }
                if (isSSG && // We don't want to send a cache header for requests that contain dynamic
                // data. If this is a Dynamic RSC request or wasn't a Prefetch RSC
                // request, then we should set the cache header.
                !isDynamicRSCRequest && (!didPostpone || isPrefetchRSCRequest)) {
                    if (!isMinimalMode) {
                        // set x-nextjs-cache header to match the header
                        // we set for the image-optimizer
                        res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');
                    }
                    // Set a header used by the client router to signal the response is static
                    // and should respect the `static` cache staleTime value.
                    res.setHeader(_approuterheaders.NEXT_IS_PRERENDER_HEADER, '1');
                }
                const { value: cachedData } = cacheEntry;
                // Coerce the cache control parameter from the render.
                let cacheControl;
                // If this is a resume request in minimal mode it is streamed with dynamic
                // content and should not be cached.
                if (hasPostponedState) {
                    cacheControl = {
                        revalidate: 0,
                        expire: undefined
                    };
                } else if (isDynamicRSCRequest) {
                    cacheControl = {
                        revalidate: 0,
                        expire: undefined
                    };
                } else if (!routeModule.isDev) {
                    // If this is a preview mode request, we shouldn't cache it
                    if (isDraftMode) {
                        cacheControl = {
                            revalidate: 0,
                            expire: undefined
                        };
                    } else if (!isSSG) {
                        if (!res.getHeader('Cache-Control')) {
                            cacheControl = {
                                revalidate: 0,
                                expire: undefined
                            };
                        }
                    } else if (cacheEntry.cacheControl) {
                        // If the cache entry has a cache control with a revalidate value that's
                        // a number, use it.
                        if (typeof cacheEntry.cacheControl.revalidate === 'number') {
                            if (cacheEntry.cacheControl.revalidate < 1) {
                                throw new Error(`Invalid revalidate configuration provided: ${cacheEntry.cacheControl.revalidate} < 1`);
                            }
                            cacheControl = {
                                revalidate: cacheEntry.cacheControl.revalidate,
                                expire: cacheEntry.cacheControl.expire
                            };
                        } else {
                            cacheControl = {
                                revalidate: _constants1.CACHE_ONE_YEAR_SECONDS,
                                expire: undefined
                            };
                        }
                    }
                }
                cacheEntry.cacheControl = cacheControl;
                if (typeof segmentPrefetchHeader === 'string' && (cachedData == null ? void 0 : cachedData.kind) === _responsecache.CachedRouteKind.APP_PAGE && cachedData.segmentData) {
                    var _cachedData_headers1;
                    // This is a prefetch request issued by the client Segment Cache. These
                    // should never reach the application layer (lambda). We should either
                    // respond from the cache (HIT) or respond with 404 (MISS).
                    // Set a header to indicate that PPR is enabled for this route. This
                    // lets the client distinguish between a regular cache miss and a cache
                    // miss due to PPR being disabled. In other contexts this header is used
                    // to indicate that the response contains dynamic data, but here we're
                    // only using it to indicate that the feature is enabled — the segment
                    // response itself contains whether the data is dynamic.
                    res.setHeader(_approuterheaders.NEXT_DID_POSTPONE_HEADER, '2');
                    // Add the cache tags header to the response if it exists and we're in
                    // minimal mode while rendering a static page.
                    const tags = (_cachedData_headers1 = cachedData.headers) == null ? void 0 : _cachedData_headers1[_constants1.NEXT_CACHE_TAGS_HEADER];
                    if (isMinimalMode && isSSG && tags && typeof tags === 'string') {
                        res.setHeader(_constants1.NEXT_CACHE_TAGS_HEADER, tags);
                    }
                    const matchedSegment = cachedData.segmentData.get(segmentPrefetchHeader);
                    if (matchedSegment !== undefined) {
                        // Cache hit
                        return (0, _sendpayload.sendRenderResult)({
                            req,
                            res,
                            generateEtags: nextConfig.generateEtags,
                            poweredByHeader: nextConfig.poweredByHeader,
                            result: _renderresult.default.fromStatic(matchedSegment, _approuterheaders.RSC_CONTENT_TYPE_HEADER),
                            cacheControl: cacheEntry.cacheControl
                        });
                    }
                    // Cache miss. Either a cache entry for this route has not been generated
                    // (which technically should not be possible when PPR is enabled, because
                    // at a minimum there should always be a fallback entry) or there's no
                    // match for the requested segment. Respond with a 404.
                    res.statusCode = 404;
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        generateEtags: nextConfig.generateEtags,
                        poweredByHeader: nextConfig.poweredByHeader,
                        result: _renderresult.default.EMPTY,
                        cacheControl: cacheEntry.cacheControl
                    });
                }
                // `onCacheEntry` lets the platform capture a freshly prerendered result
                // so the proxy can write it to the ISR cache; on deploy it returns true
                // and the function returns below. In debug-shell mode the render was
                // skipped and we only serve the already-cached shell, so there is nothing
                // to capture, and we need to reach the serve path below to close the
                // document. `onCacheEntry` is absent in `next start`/dev, so this guard
                // only affects the deploy (minimalMode) path.
                if (!isDebugStaticShell && await invokeOnCacheEntry(cacheEntry)) {
                    return null;
                }
                if (cachedData.headers) {
                    const headers = {
                        ...cachedData.headers
                    };
                    if (!isMinimalMode || !isSSG) {
                        delete headers[_constants1.NEXT_CACHE_TAGS_HEADER];
                    }
                    for (let [key, value] of Object.entries(headers)){
                        if (typeof value === 'undefined') continue;
                        if (Array.isArray(value)) {
                            for (const v of value){
                                res.appendHeader(key, v);
                            }
                        } else if (typeof value === 'number') {
                            value = value.toString();
                            res.appendHeader(key, value);
                        } else {
                            res.appendHeader(key, value);
                        }
                    }
                }
                // Add the cache tags header to the response if it exists and we're in
                // minimal mode while rendering a static page.
                const tags = (_cachedData_headers = cachedData.headers) == null ? void 0 : _cachedData_headers[_constants1.NEXT_CACHE_TAGS_HEADER];
                if (isMinimalMode && isSSG && tags && typeof tags === 'string') {
                    res.setHeader(_constants1.NEXT_CACHE_TAGS_HEADER, tags);
                }
                // If the request is a data request, then we shouldn't set the status code
                // from the response because it should always be 200. This should be gated
                // behind the experimental PPR flag.
                if (cachedData.status && (!isRSCRequest || !isRoutePPREnabled)) {
                    res.statusCode = cachedData.status;
                }
                // Redirect information is encoded in RSC payload, so we don't need to use redirect status codes
                if (!isMinimalMode && cachedData.status && _redirectstatuscode.RedirectStatusCode[cachedData.status] && isRSCRequest) {
                    res.statusCode = 200;
                }
                // Mark that the request did postpone.
                if (didPostpone && !isDynamicRSCRequest) {
                    res.setHeader(_approuterheaders.NEXT_DID_POSTPONE_HEADER, '1');
                }
                // we don't go through this block when preview mode is true
                // as preview mode is a dynamic request (bypasses cache) and doesn't
                // generate both HTML and payloads in the same request so continue to just
                // return the generated payload
                if (isRSCRequest && !isDraftMode) {
                    // If this is a dynamic RSC request, then stream the response.
                    if (typeof cachedData.rscData === 'undefined') {
                        // If the response is not an RSC response, then we can't serve it.
                        if (cachedData.html.contentType !== _approuterheaders.RSC_CONTENT_TYPE_HEADER) {
                            if (nextConfig.cacheComponents) {
                                res.statusCode = 404;
                                return (0, _sendpayload.sendRenderResult)({
                                    req,
                                    res,
                                    generateEtags: nextConfig.generateEtags,
                                    poweredByHeader: nextConfig.poweredByHeader,
                                    result: _renderresult.default.EMPTY,
                                    cacheControl: cacheEntry.cacheControl
                                });
                            } else {
                                // Otherwise this case is not expected.
                                throw new _invarianterror.InvariantError(`Expected RSC response, got ${cachedData.html.contentType}`);
                            }
                        }
                        return (0, _sendpayload.sendRenderResult)({
                            req,
                            res,
                            generateEtags: nextConfig.generateEtags,
                            poweredByHeader: nextConfig.poweredByHeader,
                            result: cachedData.html,
                            cacheControl: cacheEntry.cacheControl
                        });
                    }
                    // As this isn't a prefetch request, we should serve the static flight
                    // data.
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        generateEtags: nextConfig.generateEtags,
                        poweredByHeader: nextConfig.poweredByHeader,
                        result: _renderresult.default.fromStatic(cachedData.rscData, _approuterheaders.RSC_CONTENT_TYPE_HEADER),
                        cacheControl: cacheEntry.cacheControl
                    });
                }
                // This is a request for HTML data.
                const body = cachedData.html;
                // Instant Navigation Testing API: under the instant lock we serve the
                // static shell as a complete document without resuming the dynamic
                // render, either recovering from an empty (blocking) shell or appending
                // the closing tags to a non-empty one.
                if (isInstantNavigationTest && isDebugStaticShell) {
                    const isEmptyPrelude = typeof cachedData.postponed === 'string' && _entrybase.isEmptyHTMLPrelude(cachedData.postponed);
                    if (isEmptyPrelude) {
                        // A blocking route (a Suspense boundary above <body>, or `export
                        // const instant = false`) has an empty static shell. Serving it under
                        // the lock would be a blank document with no way to release the lock,
                        // so every reload would render the same blank shell and leave the
                        // user stuck. We surface the reason instead: in development we throw
                        // so it shows as an error overlay (the catch below clears the instant
                        // cookie via Set-Cookie); in production we serve a minimal document
                        // whose script clears the cookie client-side, since on deploy the
                        // edge has already served the cached shell and committed the response
                        // headers and this function only resumes by appending to the body, so
                        // a Set-Cookie could not take effect. `next start` reuses the same
                        // document, where throwing would render only a generic "Internal
                        // Server Error" page.
                        if (routeModule.isDev === true) {
                            throw new Error(`The Navigation Inspector was active, but you attempted to load a blocking route. Reload the page to reset the inspector.\n\n` + `To identify why this route is blocking, refer to the Instant Navigation docs: https://preview.nextjs.org/docs/app/guides/instant-navigation`);
                        }
                        const recoveryHtml = `<!DOCTYPE html><html><head><meta charSet="utf-8"/></head><body>` + `<script>document.cookie="${_approuterheaders.NEXT_INSTANT_TEST_COOKIE}=; Path=/; Max-Age=0"</script>` + `<p>The Navigation Inspector was active, but you attempted to load a blocking route. Reload the page to reset the inspector.</p>` + `<p>To identify why this route is blocking, refer to the ` + `<a href="https://preview.nextjs.org/docs/app/guides/instant-navigation">Instant Navigation docs</a>.</p>` + `</body></html>`;
                        return (0, _sendpayload.sendRenderResult)({
                            req,
                            res,
                            generateEtags: nextConfig.generateEtags,
                            poweredByHeader: nextConfig.poweredByHeader,
                            result: _renderresult.default.fromStatic(recoveryHtml, _constants1.HTML_CONTENT_TYPE_HEADER),
                            cacheControl: {
                                revalidate: 0,
                                expire: undefined
                            }
                        });
                    }
                    // Non-empty shell: the cookie-guarded bootstrap that sets
                    // self.__next_instant_test is embedded in the prerendered shell via
                    // `bootstrapScriptContent`, so it is already present (in the served
                    // shell for a fresh render, or in the cached prelude on deploy). The
                    // Turbopack bootstrap is left out of the shell for the resume to
                    // emit, so add it here. Append the closing tags so the browser can
                    // parse a complete document.
                    pushTurbopackBootstrapScript(body);
                    body.push(new ReadableStream({
                        start (controller) {
                            controller.enqueue(_encodedtags.ENCODED_TAGS.CLOSED.BODY_AND_HTML);
                            controller.close();
                        }
                    }));
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        generateEtags: nextConfig.generateEtags,
                        poweredByHeader: nextConfig.poweredByHeader,
                        result: body,
                        cacheControl: {
                            revalidate: 0,
                            expire: undefined
                        }
                    });
                }
                // If there's no postponed state, we should just serve the HTML. This
                // should also be the case for a resume request because it's completed
                // as a server render (rather than a static render).
                if (!didPostpone || isMinimalMode || isRSCRequest) {
                    // If we're in test mode, we should add a sentinel chunk to the response
                    // that's between the static and dynamic parts so we can compare the
                    // chunks and add assertions.
                    if (process.env.__NEXT_TEST_MODE && isMinimalMode && isRoutePPREnabled && body.contentType === _constants1.HTML_CONTENT_TYPE_HEADER) {
                        // As we're in minimal mode, the static part would have already been
                        // streamed first. The only part that this streams is the dynamic part
                        // so we should FIRST stream the sentinel and THEN the dynamic part.
                        body.unshift(createPPRBoundarySentinel());
                    }
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        generateEtags: nextConfig.generateEtags,
                        poweredByHeader: nextConfig.poweredByHeader,
                        result: body,
                        cacheControl: cacheEntry.cacheControl
                    });
                }
                // If we're debugging the static shell or the dynamic API accesses, we
                // should just serve the HTML without resuming the render. The returned
                // HTML will be the static shell so all the Dynamic API's will be used
                // during static generation.
                if (isDebugStaticShell || isDebugDynamicAccesses) {
                    // The Turbopack bootstrap is left out of the shell for the resume to
                    // emit, so add it here. Since we're not resuming the render, we need
                    // to at least add the closing body and html tags to create valid
                    // HTML.
                    pushTurbopackBootstrapScript(body);
                    body.push(new ReadableStream({
                        start (controller) {
                            controller.enqueue(_encodedtags.ENCODED_TAGS.CLOSED.BODY_AND_HTML);
                            controller.close();
                        }
                    }));
                    return (0, _sendpayload.sendRenderResult)({
                        req,
                        res,
                        generateEtags: nextConfig.generateEtags,
                        poweredByHeader: nextConfig.poweredByHeader,
                        result: body,
                        cacheControl: {
                            revalidate: 0,
                            expire: undefined
                        }
                    });
                }
                // If we're in test mode, we should add a sentinel chunk to the response
                // that's between the static and dynamic parts so we can compare the
                // chunks and add assertions.
                if (process.env.__NEXT_TEST_MODE) {
                    body.push(createPPRBoundarySentinel());
                }
                resumeRender(body, cachedData.postponed, span);
                return (0, _sendpayload.sendRenderResult)({
                    req,
                    res,
                    generateEtags: nextConfig.generateEtags,
                    poweredByHeader: nextConfig.poweredByHeader,
                    result: body,
                    // We don't want to cache the response if it has postponed data because
                    // the response being sent to the client it's dynamic parts are streamed
                    // to the client on the same request.
                    cacheControl: {
                        revalidate: 0,
                        expire: undefined
                    }
                });
            };
            return await handleResponse(requestSpan);
        } catch (err) {
            // If an Instant Navigation Testing document render fails (e.g. the page
            // blocks at the root with no Suspense boundary above it, producing an empty
            // or bailed-out static shell), clear the instant navigation cookie before
            // serving the error page. Otherwise the cookie would persist and every
            // reload would re-render the same broken shell, leaving the user stuck
            // without a way to release the lock.
            if (isInstantNavigationTest && !res.headersSent) {
                res.setHeader('Set-Cookie', `${_approuterheaders.NEXT_INSTANT_TEST_COOKIE}=; Path=/; Max-Age=0`);
            }
            if (!(err instanceof _nofallbackerrorexternal.NoFallbackError)) {
                const silenceLog = false;
                await routeModule.onRequestError(req, err, {
                    routerKind: 'App Router',
                    routePath: srcPage,
                    routeType: 'render',
                    revalidateReason: (0, _utils.getRevalidateReason)({
                        isStaticGeneration: isSSG,
                        isOnDemandRevalidate
                    })
                }, silenceLog, routerServerContext);
            }
            // rethrow so that we can handle serving error page
            throw err;
        }
    }
    return {
        __next_app__,
        routeModule,
        handler
    };
}
// TODO: omit this from production builds, only test builds should include it
/**
 * Creates a readable stream that emits a PPR boundary sentinel.
 *
 * @returns A readable stream that emits a PPR boundary sentinel.
 */ function createPPRBoundarySentinel() {
    return new ReadableStream({
        start (controller) {
            controller.enqueue(new TextEncoder().encode('<!-- PPR_BOUNDARY_SENTINEL -->'));
            controller.close();
        }
    });
}

//# sourceMappingURL=app-page-runtime.js.map