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
const _searchparams = require("../../server/request/search-params");
const _pathname = require("../../server/request/pathname");
const _resolvemetadataparallel = require("./resolve-metadata-parallel");
const _metadataelements = require("./metadata-elements");
const _boundarycomponents = require("../framework/boundary-components");
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
        const tags = await getMetadataResolution(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType).then(async (resolution)=>{
            const selected = await resolution.selectedViewport;
            if (selected.status === 'resolved') {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
                    children: (0, _metadataelements.createViewportElements)(selected.value)
                });
            }
            if (!errorType && (selected.status === 'not-found' || selected.status === 'forbidden' || selected.status === 'unauthorized')) {
                const convention = await getViewportForBranch(tree, pathnameForMetadata, searchParams, selected.status, interpolatedParams, metadataContext, resolution.selectedKeyPath);
                if (convention.status === 'resolved') {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
                        children: (0, _metadataelements.createViewportElements)(convention.value)
                    });
                }
            }
            return null;
        }).catch(()=>{
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
        return getResolvedParallelMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType).catch(()=>{
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
    function MetadataOutlet({ tree: outletTree }) {
        const metadataResolution = getMetadataResolution(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType);
        const pendingOutlet = metadataResolution.then((resolution)=>resolution.outlets.get(outletTree) ?? null);
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
const getResolvedParallelMetadata = (0, _react.cache)(getResolvedParallelMetadataImpl);
async function getResolvedParallelMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const resolution = await getMetadataResolution(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType);
    const selected = await resolution.selectedMetadata;
    if (selected.status === 'resolved') {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
            children: (0, _metadataelements.createMetadataElements)(selected.value)
        });
    }
    if (!errorType && (selected.status === 'not-found' || selected.status === 'forbidden' || selected.status === 'unauthorized')) {
        const convention = await getMetadataForBranch(tree, pathname, searchParams, selected.status, interpolatedParams, metadataContext, resolution.selectedKeyPath);
        if (convention.status === 'resolved') {
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
                children: (0, _metadataelements.createMetadataElements)(convention.value)
            });
        }
    }
    return null;
}
const getMetadataResolution = (0, _react.cache)(resolveMetadataResolutionImpl);
async function resolveMetadataResolutionImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return (0, _resolvemetadataparallel.resolveMetadataResolution)(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext);
}
const getMetadataForBranch = (0, _react.cache)(_resolvemetadataparallel.resolveMetadataForBranch);
const getViewportForBranch = (0, _react.cache)(_resolvemetadataparallel.resolveViewportForBranch);

//# sourceMappingURL=metadata-parallel.js.map