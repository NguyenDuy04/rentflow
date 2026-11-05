"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "exportAppPage", {
    enumerable: true,
    get: function() {
        return exportAppPage;
    }
});
const _isdynamicusageerror = require("../helpers/is-dynamic-usage-error");
const _constants = require("../../lib/constants");
const _ciinfo = require("../../server/ci-info");
const _modulerender = require("../../server/route-modules/app-page/module.render");
const _parserequestheaders = require("../../server/route-modules/app-page/parse-request-headers");
const _bailouttocsr = require("../../shared/lib/lazy-dynamic/bailout-to-csr");
const _node = require("../../server/base-http/node");
const _approuterheaders = require("../../client/components/app-router-headers");
const _runwithafter = require("../../server/after/run-with-after");
const _resumedatacache = require("../../server/resume-data-cache/resume-data-cache");
const _entryconstants = require("../../shared/lib/entry-constants");
async function exportAppPage(req, res, page, path, pathname, query, fallbackRouteParams, partialRenderOpts, htmlFilepath, debugOutput, isDynamicError, fileWriter, sharedContext, routeMatch, routeCache) {
    const afterRunner = new _runwithafter.AfterRunner();
    const renderOpts = {
        ...partialRenderOpts,
        waitUntil: afterRunner.context.waitUntil,
        onClose: afterRunner.context.onClose,
        onAfterTaskError: afterRunner.context.onTaskError
    };
    let isDefaultNotFound = false;
    let isDefaultGlobalError = false;
    // If the page is `/_not-found`, then we should update the page to be `/404`.
    if (page === _entryconstants.UNDERSCORE_NOT_FOUND_ROUTE_ENTRY) {
        isDefaultNotFound = true;
        pathname = '/404';
    }
    // If the page is `/_global-error`, then we should update the page to be `/500`.
    if (page === _entryconstants.UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY) {
        isDefaultGlobalError = true;
        pathname = '/500';
    }
    try {
        var _renderOpts_previewProps;
        const nextReq = new _node.NodeNextRequest(req);
        const parsedRequestHeaders = (0, _parserequestheaders.parseRequestHeaders)(nextReq.headers, {
            isRoutePPREnabled: renderOpts.experimental.isRoutePPREnabled === true,
            previewModeId: (_renderOpts_previewProps = renderOpts.previewProps) == null ? void 0 : _renderOpts_previewProps.previewModeId
        });
        const result = await (0, _modulerender.lazyPrerenderAppPage)(nextReq, new _node.NodeNextResponse(res), pathname, query, fallbackRouteParams, renderOpts, undefined, sharedContext, routeMatch, parsedRequestHeaders);
        if ('error' in result) {
            throw result.error;
        }
        const html = result.toUnchunkedString();
        // TODO(after): if we abort a prerender because of an error in an after-callback
        // we should probably communicate that better (and not log the error twice)
        await afterRunner.executeAfter();
        const { metadata } = result;
        const { flightData, cacheControl = {
            revalidate: false,
            expire: undefined
        }, postponed, fetchTags, fetchMetrics, segmentData, prefetchHints, renderResumeDataCache, hasPendingUi } = metadata;
        // Ensure we don't postpone without having PPR enabled.
        if (postponed && !renderOpts.experimental.isRoutePPREnabled) {
            throw new Error('Invariant: page postponed without PPR being enabled');
        }
        if (cacheControl.revalidate === 0) {
            if (isDynamicError) {
                throw new Error(`Page with dynamic = "error" encountered dynamic data method on ${path}.`);
            }
            const { staticBailoutInfo = {} } = metadata;
            if (debugOutput && (staticBailoutInfo == null ? void 0 : staticBailoutInfo.description)) {
                logDynamicUsageWarning({
                    path,
                    description: staticBailoutInfo.description,
                    stack: staticBailoutInfo.stack
                });
            }
            return {
                cacheControl,
                fetchMetrics
            };
        }
        // If page data isn't available, it means that the page couldn't be rendered
        // properly so long as we don't have unknown route params. When a route doesn't
        // have unknown route params, there will not be any flight data.
        let hasStaticRsc = false;
        if (!flightData) {
            if (!fallbackRouteParams || fallbackRouteParams.size === 0 || renderOpts.cacheComponents) {
                throw new Error(`Invariant: failed to get page data for ${path}`);
            }
        } else {
            const hasFallbackParams = fallbackRouteParams != null && fallbackRouteParams.size > 0;
            const shouldWriteRsc = !renderOpts.experimental.isRoutePPREnabled || !postponed && !hasFallbackParams;
            hasStaticRsc = shouldWriteRsc;
            // With PPR enabled, we normally skip writing .rsc because it may contain
            // dynamic data. However, for fully static outputs (no postponed state and
            // no fallback params), we can safely emit the route .rsc to support
            // static navigations.
            if (shouldWriteRsc) {
                fileWriter.append(htmlFilepath.replace(/\.html$/, _constants.RSC_SUFFIX), flightData);
            }
        }
        let segmentPaths;
        if (segmentData) {
            // Emit the per-segment prefetch data. We emit them as separate files
            // so that the cache handler has the option to treat each as a
            // separate entry.
            segmentPaths = [];
            const segmentsDir = htmlFilepath.replace(/\.html$/, _constants.RSC_SEGMENTS_DIR_SUFFIX);
            for (const [segmentPath, buffer] of segmentData){
                segmentPaths.push(segmentPath);
                const segmentDataFilePath = segmentsDir + segmentPath + _constants.RSC_SEGMENT_SUFFIX;
                fileWriter.append(segmentDataFilePath, buffer);
            }
        }
        const headers = {
            ...metadata.headers
        };
        // If we're writing the file to disk, we know it's a prerender.
        headers[_approuterheaders.NEXT_IS_PRERENDER_HEADER] = '1';
        if (fetchTags) {
            headers[_constants.NEXT_CACHE_TAGS_HEADER] = fetchTags;
        }
        // Writing static HTML to a file.
        fileWriter.append(htmlFilepath, html);
        const isParallelRoute = /\/@\w+/.test(page);
        const isNonSuccessfulStatusCode = res.statusCode > 300;
        // When PPR is enabled, we don't always send 200 for routes that have been
        // pregenerated, so we should grab the status code from the mocked
        // response.
        let status = renderOpts.experimental.isRoutePPREnabled ? res.statusCode : undefined;
        if (isDefaultNotFound) {
            // Override the default /_not-found page status code to 404
            status = 404;
        } else if (isDefaultGlobalError) {
            // Override the default /_global-error page status code to 500
            status = 500;
        } else if (isNonSuccessfulStatusCode && !isParallelRoute) {
            // If it's parallel route the status from mock response is 404
            status = res.statusCode;
        }
        // Writing the request metadata to a file.
        const meta = {
            status,
            headers,
            postponed,
            segmentPaths,
            prefetchHints,
            routeCache
        };
        fileWriter.append(htmlFilepath.replace(/\.html$/, _constants.NEXT_META_SUFFIX), JSON.stringify(meta, null, 2));
        let serializedRenderResumeDataCache;
        if (renderResumeDataCache) {
            serializedRenderResumeDataCache = await (0, _resumedatacache.stringifyResumeDataCache)(renderResumeDataCache, renderOpts.cacheComponents);
            if (!renderOpts.experimental.disableResumeDataCacheCompression) {
                serializedRenderResumeDataCache = (0, _resumedatacache.deflateResumeDataCache)(serializedRenderResumeDataCache);
            }
        }
        return {
            // Filter the metadata if the environment does not have next support.
            metadata: _ciinfo.hasNextSupport ? meta : {
                segmentPaths: meta.segmentPaths,
                prefetchHints: meta.prefetchHints
            },
            hasEmptyStaticShell: Boolean(postponed) && html === '',
            hasPostponed: Boolean(postponed),
            hasPendingUi: hasPendingUi ?? false,
            htmlSize: Buffer.byteLength(html),
            hasStaticRsc,
            cacheControl,
            fetchMetrics,
            renderResumeDataCache: serializedRenderResumeDataCache
        };
    } catch (err) {
        if (!(0, _isdynamicusageerror.isDynamicUsageError)(err)) {
            throw err;
        }
        // We should fail rendering if a client side rendering bailout
        // occurred at the page level.
        if ((0, _bailouttocsr.isBailoutToCSRError)(err)) {
            throw err;
        }
        let fetchMetrics;
        if (debugOutput) {
            const store = renderOpts.store;
            const { dynamicUsageDescription, dynamicUsageStack } = store;
            fetchMetrics = store.fetchMetrics;
            logDynamicUsageWarning({
                path,
                description: dynamicUsageDescription ?? '',
                stack: dynamicUsageStack
            });
        }
        return {
            cacheControl: {
                revalidate: 0,
                expire: undefined
            },
            fetchMetrics
        };
    }
}
function logDynamicUsageWarning({ path, description, stack }) {
    const errMessage = new Error(`Static generation failed due to dynamic usage on ${path}, reason: ${description}`);
    if (stack) {
        errMessage.stack = errMessage.message + stack.substring(stack.indexOf('\n'));
    }
    console.warn(errMessage);
}

//# sourceMappingURL=app-page.js.map