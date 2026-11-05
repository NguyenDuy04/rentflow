"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    resolveMetadataForBranch: null,
    resolveMetadataResolution: null,
    resolveViewportForBranch: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    resolveMetadataForBranch: function() {
        return resolveMetadataForBranch;
    },
    resolveMetadataResolution: function() {
        return resolveMetadataResolution;
    },
    resolveViewportForBranch: function() {
        return resolveViewportForBranch;
    }
});
require("server-only");
const _defaultmetadata = require("./default-metadata");
const _getsegmentparam = require("../../shared/lib/router/utils/get-segment-param");
const _appdirmodule = require("../../server/lib/app-dir-module");
const _params = require("../../server/request/params");
const _segment = require("../../shared/lib/segment");
const _default = require("../../client/components/builtin/default");
const _defaultnull = require("../../client/components/builtin/default-null");
const _workasyncstorageexternal = require("../../server/app-render/work-async-storage.external");
const _invarianterror = require("../../shared/lib/invariant-error");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _clientandserverreferences = require("../client-and-server-references");
const _lazyresult = require("../../server/lib/lazy-result");
const _httpaccessfallback = require("../../client/components/http-access-fallback/http-access-fallback");
const _redirecterror = require("../../client/components/redirect-error");
const _metadataresolutionprimitives = require("./metadata-resolution-primitives");
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
const METADATA = 1;
const VIEWPORT = 2;
const METADATA_AND_VIEWPORT = 3;
async function collectMetadataAndViewport({ tree, props, route, errorConvention, resolutionTarget }) {
    const shouldResolveMetadata = Boolean(resolutionTarget & METADATA);
    const shouldResolveViewport = Boolean(resolutionTarget & VIEWPORT);
    const moduleResultPromise = errorConvention ? (0, _appdirmodule.getComponentTypeModule)(tree, 'layout').then((mod)=>({
            mod,
            modType: errorConvention
        })) : (0, _appdirmodule.getLayoutOrPageModule)(tree);
    const staticFilesMetadata = shouldResolveMetadata ? (0, _metadataresolutionprimitives.resolveStaticMetadata)(tree[2], props) : Promise.resolve(null);
    // Static metadata is resolved eagerly, but its rejection belongs to this
    // branch and will be replayed through the branch's metadata outlet.
    staticFilesMetadata.catch(()=>null);
    const moduleResult = await moduleResultPromise;
    const hasStaticFilesMetadata = shouldResolveMetadata && hasStaticMetadataFiles(tree);
    if (moduleResult.modType) {
        route += `/${moduleResult.modType}`;
    }
    const metadata = shouldResolveMetadata && moduleResult.mod ? (0, _metadataresolutionprimitives.getDefinedMetadata)(moduleResult.mod, props, {
        route
    }) : null;
    const viewport = shouldResolveViewport && moduleResult.mod ? (0, _metadataresolutionprimitives.getDefinedViewport)(moduleResult.mod, props, {
        route
    }) : null;
    let errorLayer = null;
    if (errorConvention && tree[2][errorConvention]) {
        const errorMod = await (0, _appdirmodule.getComponentTypeModule)(tree, errorConvention);
        errorLayer = {
            metadata: shouldResolveMetadata && errorMod ? (0, _metadataresolutionprimitives.getDefinedMetadata)(errorMod, props, {
                route
            }) : null,
            viewport: shouldResolveViewport && errorMod ? (0, _metadataresolutionprimitives.getDefinedViewport)(errorMod, props, {
                route
            }) : null,
            staticFilesMetadata,
            hasStaticFilesMetadata
        };
    }
    return {
        metadata,
        viewport,
        staticFilesMetadata,
        hasStaticFilesMetadata,
        errorLayer
    };
}
function callResolver(resolver) {
    let result;
    try {
        result = resolver();
    } catch (error) {
        result = Promise.reject(error);
    }
    if (result instanceof Promise) {
        // Generators are eagerly executed, so attach a rejection handler before
        // an earlier layer can suspend or fail.
        result.catch(()=>null);
    }
    return result;
}
function getResult(exportForResult) {
    if (typeof exportForResult === 'function') {
        // If the function is a 'use cache' function that uses the parent data as
        // the second argument, we don't want to eagerly execute it during
        // metadata/viewport pre-rendering, as the parent data might also be
        // computed from another 'use cache' function. To ensure that the hanging
        // input abort signal handling works in this case (i.e. the depending
        // function waits for the cached input to resolve while encoding its args),
        // they must be called sequentially. This can be accomplished by wrapping
        // the call in a lazy promise, so that the original function is only called
        // when the result is actually awaited.
        const useCacheFunctionInfo = (0, _clientandserverreferences.getUseCacheFunctionInfo)(exportForResult.$$original);
        if (useCacheFunctionInfo && !useCacheFunctionInfo.usedArgs[1]) {
            return {
                resolveParent: null,
                result: callResolver(()=>{
                    // @ts-expect-error We intentionally omit the parent argument, because
                    // we know this 'use cache' function does not use it.
                    return exportForResult();
                })
            };
        }
        let resolveParent;
        const parent = new Promise((resolve)=>{
            resolveParent = resolve;
        });
        return {
            resolveParent: resolveParent,
            result: useCacheFunctionInfo ? (0, _lazyresult.createLazyResult)(()=>exportForResult(parent)) : callResolver(()=>exportForResult(parent))
        };
    }
    return {
        resolveParent: null,
        result: typeof exportForResult === 'object' ? exportForResult : null
    };
}
function resolveParentResult(parentResult, resolveParent) {
    if (process.env.NODE_ENV === 'development') {
        parentResult = require('../../shared/lib/deep-freeze').deepFreeze(structuredClone(parentResult));
    }
    resolveParent(parentResult);
}
function cloneStaticMetadata(metadata) {
    if (!metadata) return null;
    return {
        ...metadata,
        icon: metadata.icon ? [
            ...metadata.icon
        ] : undefined,
        apple: metadata.apple ? [
            ...metadata.apple
        ] : undefined,
        openGraph: metadata.openGraph ? [
            ...metadata.openGraph
        ] : undefined,
        twitter: metadata.twitter ? [
            ...metadata.twitter
        ] : undefined
    };
}
function createMetadataAccumulator() {
    return {
        metadata: (0, _defaultmetadata.createDefaultMetadata)(),
        titleTemplates: {
            title: null,
            twitter: null,
            openGraph: null
        },
        favicon: null,
        leafSegmentStaticIcons: {
            icon: [],
            apple: []
        },
        buildState: {
            warnings: new Set()
        }
    };
}
function cloneMetadataAccumulator(accumulator) {
    return {
        metadata: structuredClone(accumulator.metadata),
        titleTemplates: {
            ...accumulator.titleTemplates
        },
        favicon: accumulator.favicon ? structuredClone(accumulator.favicon) : null,
        leafSegmentStaticIcons: {
            icon: structuredClone(accumulator.leafSegmentStaticIcons.icon),
            apple: structuredClone(accumulator.leafSegmentStaticIcons.apple)
        },
        buildState: {
            warnings: new Set(accumulator.buildState.warnings)
        }
    };
}
function cloneViewportAccumulator(accumulator) {
    return {
        viewport: structuredClone(accumulator.viewport)
    };
}
async function accumulateMetadataLayer(parent, prerendered, staticMetadata, route, layerIndex, pathname, metadataContext) {
    var _staticFilesMetadata_icon;
    const accumulator = await parent;
    const staticFilesMetadata = cloneStaticMetadata(await staticMetadata);
    // Treat favicon as a special case. It should be the first icon in the list.
    // layerIndex <= 1 represents the root layout and a page at the root.
    if (layerIndex <= 1 && (0, _metadataresolutionprimitives.isFavicon)(staticFilesMetadata == null ? void 0 : (_staticFilesMetadata_icon = staticFilesMetadata.icon) == null ? void 0 : _staticFilesMetadata_icon[0])) {
        var _staticFilesMetadata_icon1;
        const icon = staticFilesMetadata == null ? void 0 : (_staticFilesMetadata_icon1 = staticFilesMetadata.icon) == null ? void 0 : _staticFilesMetadata_icon1.shift();
        if (layerIndex === 0 && icon) {
            accumulator.favicon = (0, _metadataresolutionprimitives.convertUrlsToStrings)(icon);
        }
    }
    if (prerendered.resolveParent) {
        resolveParentResult(accumulator.metadata, prerendered.resolveParent);
    }
    let metadata;
    if (isPromiseLike(prerendered.result)) {
        metadata = await prerendered.result;
    } else {
        metadata = prerendered.result;
    }
    await (0, _metadataresolutionprimitives.mergeMetadata)(route, pathname, {
        metadata,
        resolvedMetadata: accumulator.metadata,
        staticFilesMetadata,
        titleTemplates: accumulator.titleTemplates,
        metadataContext,
        buildState: accumulator.buildState,
        leafSegmentStaticIcons: accumulator.leafSegmentStaticIcons,
        cloneResolvedMetadata: false
    });
    return accumulator;
}
async function accumulateViewportLayer(parent, prerendered) {
    const accumulator = await parent;
    if (prerendered.resolveParent) {
        resolveParentResult(accumulator.viewport, prerendered.resolveParent);
    }
    let viewport;
    if (isPromiseLike(prerendered.result)) {
        viewport = await prerendered.result;
    } else {
        viewport = prerendered.result;
    }
    (0, _metadataresolutionprimitives.mergeViewport)({
        resolvedViewport: accumulator.viewport,
        viewport,
        cloneResolvedViewport: false
    });
    return accumulator;
}
function prepareMetadataAccumulatorForChild(parent, clone, childIsPage, errorConvention) {
    return parent.then((parentAccumulator)=>{
        const accumulator = clone ? cloneMetadataAccumulator(parentAccumulator) : parentAccumulator;
        // A title template applies to a descendant segment, but not to a page in
        // the same segment. Error convention metadata is an additional terminal
        // layer, so the leaf layout's template does apply to it.
        if (!childIsPage || errorConvention) {
            var _accumulator_metadata_title, _accumulator_metadata_openGraph, _accumulator_metadata_twitter;
            accumulator.titleTemplates = {
                title: ((_accumulator_metadata_title = accumulator.metadata.title) == null ? void 0 : _accumulator_metadata_title.template) || null,
                openGraph: ((_accumulator_metadata_openGraph = accumulator.metadata.openGraph) == null ? void 0 : _accumulator_metadata_openGraph.title.template) || null,
                twitter: ((_accumulator_metadata_twitter = accumulator.metadata.twitter) == null ? void 0 : _accumulator_metadata_twitter.title.template) || null
            };
        }
        return accumulator;
    });
}
function prepareViewportAccumulatorForChild(parent, clone) {
    return clone ? parent.then(cloneViewportAccumulator) : parent;
}
function completeMetadataAccumulator(accumulator, metadataContext) {
    const { leafSegmentStaticIcons, metadata } = accumulator;
    if ((leafSegmentStaticIcons.icon.length > 0 || leafSegmentStaticIcons.apple.length > 0) && !metadata.icons) {
        metadata.icons = {
            icon: [],
            apple: []
        };
        if (leafSegmentStaticIcons.icon.length > 0) {
            metadata.icons.icon.unshift(...(0, _metadataresolutionprimitives.convertUrlsToStrings)(leafSegmentStaticIcons.icon));
        }
        if (leafSegmentStaticIcons.apple.length > 0) {
            metadata.icons.apple.unshift(...(0, _metadataresolutionprimitives.convertUrlsToStrings)(leafSegmentStaticIcons.apple));
        }
    }
    return (0, _metadataresolutionprimitives.postProcessMetadata)(metadata, accumulator.favicon, accumulator.titleTemplates, metadataContext);
}
function getResolutionStatus(reason) {
    if ((0, _httpaccessfallback.isHTTPAccessFallbackError)(reason)) {
        return (0, _httpaccessfallback.getAccessFallbackErrorTypeByStatus)((0, _httpaccessfallback.getAccessFallbackHTTPStatus)(reason)) || 'error';
    }
    if ((0, _redirecterror.isRedirectError)(reason)) {
        return 'redirect';
    }
    return 'error';
}
function createRejectedOutcome(reason) {
    return {
        status: getResolutionStatus(reason),
        reason
    };
}
function createMetadataBranchOutcome(pendingAccumulator, metadataContext) {
    const completed = pendingAccumulator.then((accumulator)=>({
            value: (0, _metadataresolutionprimitives.createSelectedMetadata)(completeMetadataAccumulator(accumulator, metadataContext)),
            warnings: accumulator.buildState.warnings
        }));
    return completed.then(({ value, warnings })=>({
            status: 'resolved',
            value,
            warnings
        }), createRejectedOutcome);
}
function createViewportBranchOutcome(pendingAccumulator) {
    return pendingAccumulator.then((accumulator)=>({
            status: 'resolved',
            value: accumulator.viewport
        }), createRejectedOutcome);
}
function createOutletPromise(metadataOutcome, viewportOutcome) {
    let pendingOutcomes = 2;
    const outlet = new Promise((resolve, reject)=>{
        function settle(outcome) {
            if (outcome.status !== 'resolved') {
                reject(outcome.reason);
            } else if (--pendingOutcomes === 0) {
                resolve(null);
            }
        }
        metadataOutcome.then(settle, reject);
        viewportOutcome.then(settle, reject);
    });
    // Outlet promises can reject before React renders the corresponding slot.
    // Observe the rejection immediately while preserving it for React to replay.
    outlet.catch(()=>null);
    return outlet;
}
function appendTreeRoute(parentRoute, segment) {
    if (segment === _segment.PAGE_SEGMENT_KEY) return parentRoute;
    if (parentRoute === null) return segment;
    return `${parentRoute}/${segment}`;
}
function isPageTree(tree) {
    const { layout, page, defaultPage } = tree[2];
    return layout === undefined && (page !== undefined || defaultPage !== undefined && tree[0] === _segment.DEFAULT_SEGMENT_KEY);
}
function isBuiltinFallback(tree) {
    const { defaultPage } = tree[2];
    return (defaultPage == null ? void 0 : defaultPage[1].endsWith(_default.PARALLEL_ROUTE_DEFAULT_PATH)) === true || (defaultPage == null ? void 0 : defaultPage[1].endsWith(_defaultnull.PARALLEL_ROUTE_DEFAULT_NULL_PATH)) === true;
}
function hasHeadDefinition(layer) {
    if (layer === null) return false;
    return layer.metadata !== null || layer.viewport !== null || layer.hasStaticFilesMetadata;
}
function hasStaticMetadataFiles(tree) {
    var _metadata_icon, _metadata_apple, _metadata_openGraph, _metadata_twitter;
    const metadata = tree[2].metadata;
    return Boolean(metadata && ((((_metadata_icon = metadata.icon) == null ? void 0 : _metadata_icon.length) ?? 0) > 0 || (((_metadata_apple = metadata.apple) == null ? void 0 : _metadata_apple.length) ?? 0) > 0 || (((_metadata_openGraph = metadata.openGraph) == null ? void 0 : _metadata_openGraph.length) ?? 0) > 0 || (((_metadata_twitter = metadata.twitter) == null ? void 0 : _metadata_twitter.length) ?? 0) > 0 || metadata.manifest !== undefined));
}
function selectDefaultMetadataBranch(branches, forkDepth) {
    if (branches.length === 0) {
        throw new _invarianterror.InvariantError('Expected at least one metadata branch');
    }
    let selected = branches[0];
    for(let i = 1; i < branches.length; i++){
        const candidate = branches[i];
        if (selected.branch.isBuiltinFallback !== candidate.branch.isBuiltinFallback) {
            if (!candidate.branch.isBuiltinFallback) {
                selected = candidate;
            }
            continue;
        }
        const selectedIsChildren = selected.key === 'children';
        const candidateIsChildren = candidate.key === 'children';
        if (selectedIsChildren !== candidateIsChildren) {
            const childrenBranch = selectedIsChildren ? selected : candidate;
            const namedBranch = selectedIsChildren ? candidate : selected;
            const childrenDefinesHead = childrenBranch.branch.definitionDepth > forkDepth;
            const namedDefinesHead = namedBranch.branch.definitionDepth > forkDepth;
            // Prefer children when it contributes to the head. Otherwise, allow a
            // named slot with its own definition to provide the selected metadata.
            selected = childrenDefinesHead || !namedDefinesHead ? childrenBranch : namedBranch;
            continue;
        }
        if (candidate.branch.definitionDepth > selected.branch.definitionDepth) {
            selected = candidate;
            continue;
        }
        if (candidate.branch.definitionDepth < selected.branch.definitionDepth) {
            continue;
        }
        const selectedDepth = selected.branch.keyPath.length;
        const candidateDepth = candidate.branch.keyPath.length;
        if (candidateDepth > selectedDepth) {
            selected = candidate;
            continue;
        }
        if (candidateDepth === selectedDepth && candidate.key < selected.key) {
            selected = candidate;
        }
    }
    return selected.branch;
}
async function walkMetadataTree(context, state) {
    const [segment, parallelRoutes, { page }] = state.tree;
    const treeRoute = appendTreeRoute(state.treeRoute, segment);
    const isPage = page !== undefined;
    const depth = state.keyPath.length;
    const shouldResolveMetadata = Boolean(context.resolutionTarget & METADATA);
    const shouldResolveViewport = Boolean(context.resolutionTarget & VIEWPORT);
    let currentParams = state.parentParams;
    const segmentParam = (0, _getsegmentparam.getSegmentParam)(segment);
    if (segmentParam) {
        const value = context.interpolatedParams[segmentParam.paramName];
        if (value !== null && value !== undefined) {
            currentParams = {
                ...state.parentParams,
                [segmentParam.paramName]: value
            };
        }
    }
    const optionalCatchAllParamName = (segmentParam == null ? void 0 : segmentParam.paramType) === 'optional-catchall' && (context.interpolatedParams[segmentParam.paramName] === null || context.interpolatedParams[segmentParam.paramName] === undefined) ? segmentParam.paramName : state.parentOptionalCatchAllParamName;
    const params = (0, _params.createServerParamsForMetadata)(currentParams, optionalCatchAllParamName);
    const props = isPage ? {
        params,
        searchParams: context.searchParams
    } : {
        params
    };
    const layer = await collectMetadataAndViewport({
        tree: state.tree,
        props,
        route: treeRoute ?? '',
        errorConvention: context.errorConvention,
        resolutionTarget: context.resolutionTarget
    });
    let definitionDepth = hasHeadDefinition(layer) ? depth : state.definitionDepth;
    // Invoke each active generator as soon as this layer is discovered. Its
    // parent promise is resolved later when the preceding accumulator is ready.
    let metadata = state.metadataParent;
    if (shouldResolveMetadata) {
        const prerenderedMetadata = getResult(layer.metadata);
        metadata = accumulateMetadataLayer(metadata, prerenderedMetadata, layer.staticFilesMetadata, context.route, depth, context.pathname, context.metadataContext);
    }
    let viewport = state.viewportParent;
    if (shouldResolveViewport) {
        const prerenderedViewport = getResult(layer.viewport);
        viewport = accumulateViewportLayer(viewport, prerenderedViewport);
    }
    const errorLayer = layer.errorLayer || state.errorLayer;
    let parallelRouteKeys = Object.keys(parallelRoutes);
    if (context.selectedKeyPath !== null) {
        const selectedKey = context.selectedKeyPath[depth];
        if (parallelRouteKeys.length === 0) {
            if (selectedKey !== undefined) {
                throw new _invarianterror.InvariantError('Expected selected metadata branch to end at a leaf');
            }
        } else {
            if (selectedKey === undefined || !parallelRoutes[selectedKey]) {
                throw new _invarianterror.InvariantError('Expected selected metadata branch to match loader tree');
            }
            parallelRouteKeys = [
                selectedKey
            ];
        }
    }
    if (parallelRouteKeys.length === 0) {
        if (context.errorConvention) {
            if (hasHeadDefinition(errorLayer)) {
                definitionDepth = depth + 1;
            }
            if (shouldResolveMetadata) {
                const errorMetadata = getResult((errorLayer == null ? void 0 : errorLayer.metadata) || null);
                metadata = accumulateMetadataLayer(metadata, errorMetadata, (errorLayer == null ? void 0 : errorLayer.staticFilesMetadata) || Promise.resolve(null), context.route, depth + 1, context.pathname, context.metadataContext);
            }
            if (shouldResolveViewport) {
                const errorViewport = getResult((errorLayer == null ? void 0 : errorLayer.viewport) || null);
                viewport = accumulateViewportLayer(viewport, errorViewport);
            }
        }
        const metadataOutcome = createMetadataBranchOutcome(metadata, context.metadataContext);
        const viewportOutcome = createViewportBranchOutcome(viewport);
        context.outlets.set(state.tree, createOutletPromise(metadataOutcome, viewportOutcome));
        return {
            metadata: metadataOutcome,
            viewport: viewportOutcome,
            keyPath: state.keyPath,
            definitionDepth,
            isBuiltinFallback: isBuiltinFallback(state.tree)
        };
    }
    const cloneAtFork = parallelRouteKeys.length > 1;
    const pendingChildBranches = [];
    for (const parallelRouteKey of parallelRouteKeys){
        const childTree = parallelRoutes[parallelRouteKey];
        const childKeyPath = [
            ...state.keyPath,
            parallelRouteKey
        ];
        const branch = walkMetadataTree(context, {
            tree: childTree,
            treeRoute,
            parentParams: currentParams,
            parentOptionalCatchAllParamName: optionalCatchAllParamName,
            metadataParent: prepareMetadataAccumulatorForChild(metadata, cloneAtFork && shouldResolveMetadata, isPageTree(childTree), context.errorConvention),
            viewportParent: prepareViewportAccumulatorForChild(viewport, cloneAtFork && shouldResolveViewport),
            errorLayer,
            definitionDepth,
            keyPath: childKeyPath
        });
        // Child walks start eagerly, but are awaited in order below. Observe each
        // rejection now so a failure in one branch cannot leave a later sibling's
        // rejection unhandled.
        branch.catch(()=>null);
        pendingChildBranches.push({
            key: parallelRouteKey,
            branch
        });
    }
    const childBranches = [];
    for (const pendingChildBranch of pendingChildBranches){
        childBranches.push({
            key: pendingChildBranch.key,
            branch: await pendingChildBranch.branch
        });
    }
    return selectDefaultMetadataBranch(childBranches, depth);
}
async function resolveMetadataTree(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, selectedKeyPath, resolutionTarget) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (!workStore) {
        throw new _invarianterror.InvariantError('Expected workStore to be initialized');
    }
    const outlets = new Map();
    const selectedBranch = await walkMetadataTree({
        pathname,
        searchParams,
        errorConvention,
        interpolatedParams,
        metadataContext,
        route: workStore.route,
        selectedKeyPath,
        resolutionTarget,
        outlets
    }, {
        tree,
        treeRoute: null,
        parentParams: {},
        parentOptionalCatchAllParamName: null,
        metadataParent: Promise.resolve(createMetadataAccumulator()),
        viewportParent: Promise.resolve({
            viewport: (0, _defaultmetadata.createDefaultViewport)()
        }),
        errorLayer: null,
        definitionDepth: -1,
        keyPath: []
    });
    const selected = selectedBranch.metadata.then((outcome)=>{
        if (outcome.status === 'resolved') {
            for (const warning of outcome.warnings){
                _log.warn(warning);
            }
        }
        return outcome;
    });
    return {
        selectedKeyPath: selectedBranch.keyPath,
        selectedMetadata: selected,
        selectedViewport: selectedBranch.viewport,
        outlets
    };
}
function resolveMetadataResolution(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext) {
    return resolveMetadataTree(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, null, METADATA_AND_VIEWPORT);
}
async function resolveMetadataForBranch(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, selectedKeyPath) {
    const resolution = await resolveMetadataTree(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, selectedKeyPath, METADATA);
    return resolution.selectedMetadata;
}
async function resolveViewportForBranch(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, selectedKeyPath) {
    const resolution = await resolveMetadataTree(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext, selectedKeyPath, VIEWPORT);
    return resolution.selectedViewport;
}
function isPromiseLike(value) {
    return typeof value === 'object' && value !== null && typeof value.then === 'function';
}

//# sourceMappingURL=resolve-metadata-parallel.js.map