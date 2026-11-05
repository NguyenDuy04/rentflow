"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMetadataComponents", {
    enumerable: true,
    get: function() {
        return createMetadataComponents;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _resolvemetadata = require("./resolve-metadata");
const _httpaccessfallback = require("../../client/components/http-access-fallback/http-access-fallback");
const _searchparams = require("../../server/request/search-params");
const _pathname = require("../../server/request/pathname");
const _boundarycomponents = require("../framework/boundary-components");
const _metadataelements = require("./metadata-elements");
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
function createMetadataComponents({ tree, pathname, parsedQuery, metadataContext, interpolatedParams, errorType, serveStreamingMetadata }) {
    const searchParams = (0, _searchparams.createServerSearchParamsForMetadata)(parsedQuery);
    const pathnameForMetadata = (0, _pathname.createServerPathnameForMetadata)(pathname);
    async function Viewport() {
        const tags = await getResolvedViewport(tree, searchParams, interpolatedParams, errorType).catch((viewportErr)=>{
            if (!errorType && (0, _httpaccessfallback.isHTTPAccessFallbackError)(viewportErr)) {
                return getNotFoundViewport(tree, searchParams, interpolatedParams).catch(()=>null);
            }
            // We're going to throw the error from the metadata outlet so we just render null here instead
            return null;
        });
        return tags;
    }
    Viewport.displayName = 'Next.Viewport';
    function ViewportWrapper() {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_boundarycomponents.ViewportBoundary, {
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Viewport, {})
        });
    }
    // Metadata resolution must start while rendering so it observes the current
    // work unit store.
    function getSelectedMetadata() {
        return getResolvedMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType).catch((metadataErr)=>{
            if (!errorType && (0, _httpaccessfallback.isHTTPAccessFallbackError)(metadataErr)) {
                return getNotFoundMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext).catch(()=>null);
            }
            // We're going to throw the error from the metadata outlet so we just render null here instead
            return null;
        });
    }
    async function Metadata() {
        return await getSelectedMetadata();
    }
    Metadata.displayName = 'Next.Metadata';
    function MetadataBlocker() {
        return serveStreamingMetadata ? null : getSelectedMetadata().then(()=>null);
    }
    function MetadataWrapper() {
        // Keep the same component structure in streaming and blocking renders.
        // The blocker only holds the shell open when metadata must not stream.
        // React requires top-level suspenseful metadata to be nested under a host
        // element. Otherwise it becomes part of the document preamble and blocks
        // shell flushing instead of streaming. Metadata tags are hoisted out, so
        // this hidden wrapper remains empty.
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_boundarycomponents.MetadataBoundary, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    hidden: true,
                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {
                        name: "Next.Metadata",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Metadata, {})
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataBlocker, {})
            ]
        });
    }
    function MetadataOutlet() {
        const pendingOutlet = Promise.all([
            getResolvedMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType),
            getResolvedViewport(tree, searchParams, interpolatedParams, errorType)
        ]).then(()=>null);
        if (!serveStreamingMetadata) {
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_boundarycomponents.OutletBoundary, {
                children: pendingOutlet
            });
        }
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_boundarycomponents.OutletBoundary, {
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {
                name: "Next.MetadataOutlet",
                children: pendingOutlet
            })
        });
    }
    MetadataOutlet.displayName = 'Next.MetadataOutlet';
    return {
        Viewport: ViewportWrapper,
        Metadata: MetadataWrapper,
        MetadataOutlet
    };
}
const getResolvedMetadata = (0, _react.cache)(getResolvedMetadataImpl);
async function getResolvedMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, errorConvention);
}
const getNotFoundMetadata = (0, _react.cache)(getNotFoundMetadataImpl);
async function getNotFoundMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext) {
    const notFoundErrorConvention = 'not-found';
    return renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, notFoundErrorConvention);
}
const getResolvedViewport = (0, _react.cache)(getResolvedViewportImpl);
async function getResolvedViewportImpl(tree, searchParams, interpolatedParams, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderViewport(tree, searchParams, interpolatedParams, errorConvention);
}
const getNotFoundViewport = (0, _react.cache)(getNotFoundViewportImpl);
async function getNotFoundViewportImpl(tree, searchParams, interpolatedParams) {
    const notFoundErrorConvention = 'not-found';
    return renderViewport(tree, searchParams, interpolatedParams, notFoundErrorConvention);
}
async function renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, errorConvention) {
    const resolvedMetadata = await (0, _resolvemetadata.resolveMetadata)(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: (0, _metadataelements.createMetadataElements)((0, _resolvemetadata.createSelectedMetadata)(resolvedMetadata))
    });
}
async function renderViewport(tree, searchParams, interpolatedParams, errorConvention) {
    const resolvedViewport = await (0, _resolvemetadata.resolveViewport)(tree, searchParams, errorConvention, interpolatedParams);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: (0, _metadataelements.createViewportElements)(resolvedViewport)
    });
}

//# sourceMappingURL=metadata.js.map