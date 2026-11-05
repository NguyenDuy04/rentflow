import { getSegmentParam } from '../../shared/lib/router/utils/get-segment-param';
import { workAsyncStorage } from '../../server/app-render/work-async-storage.external';
import { InvariantError } from '../../shared/lib/invariant-error';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'server-only';
import { cache } from 'react';
import { createDefaultMetadata, createDefaultViewport } from './default-metadata';
import { getComponentTypeModule, getLayoutOrPageModule } from '../../server/lib/app-dir-module';
import { PAGE_SEGMENT_KEY } from '../../shared/lib/segment';
import * as Log from '../../build/output/log';
import { createServerParamsForMetadata } from '../../server/request/params';
import { getUseCacheFunctionInfo } from '../client-and-server-references';
import { createLazyResult } from '../../server/lib/lazy-result';
import { createSelectedMetadata, getDefinedMetadata, getDefinedViewport, isFavicon, mergeMetadata, mergeViewport, postProcessMetadata, resolveStaticMetadata } from './metadata-resolution-primitives';
export { createSelectedMetadata };
// [layout.metadata, static files metadata] -> ... -> [page.metadata, static files metadata]
async function collectMetadata({ tree, metadataItems, errorMetadataItem, props, route, errorConvention }) {
    let mod;
    let modType;
    const hasErrorConventionComponent = Boolean(errorConvention && tree[2][errorConvention]);
    if (errorConvention) {
        mod = await getComponentTypeModule(tree, 'layout');
        modType = errorConvention;
    } else {
        const { mod: layoutOrPageMod, modType: layoutOrPageModType } = await getLayoutOrPageModule(tree);
        mod = layoutOrPageMod;
        modType = layoutOrPageModType;
    }
    if (modType) {
        route += `/${modType}`;
    }
    const staticFilesMetadata = await resolveStaticMetadata(tree[2], props);
    const metadataExport = mod ? getDefinedMetadata(mod, props, {
        route
    }) : null;
    metadataItems.push([
        metadataExport,
        staticFilesMetadata
    ]);
    if (hasErrorConventionComponent && errorConvention) {
        const errorMod = await getComponentTypeModule(tree, errorConvention);
        const errorMetadataExport = errorMod ? getDefinedMetadata(errorMod, props, {
            route
        }) : null;
        errorMetadataItem[0] = errorMetadataExport;
        errorMetadataItem[1] = staticFilesMetadata;
    }
}
// [layout.metadata, static files metadata] -> ... -> [page.metadata, static files metadata]
async function collectViewport({ tree, viewportItems, errorViewportItemRef, props, route, errorConvention }) {
    let mod;
    let modType;
    const hasErrorConventionComponent = Boolean(errorConvention && tree[2][errorConvention]);
    if (errorConvention) {
        mod = await getComponentTypeModule(tree, 'layout');
        modType = errorConvention;
    } else {
        const { mod: layoutOrPageMod, modType: layoutOrPageModType } = await getLayoutOrPageModule(tree);
        mod = layoutOrPageMod;
        modType = layoutOrPageModType;
    }
    if (modType) {
        route += `/${modType}`;
    }
    const viewportExport = mod ? getDefinedViewport(mod, props, {
        route
    }) : null;
    viewportItems.push(viewportExport);
    if (hasErrorConventionComponent && errorConvention) {
        const errorMod = await getComponentTypeModule(tree, errorConvention);
        const errorViewportExport = errorMod ? getDefinedViewport(errorMod, props, {
            route
        }) : null;
        errorViewportItemRef.current = errorViewportExport;
    }
}
const resolveMetadataItems = cache(async function(tree, searchParams, errorConvention, interpolatedParams) {
    const parentParams = {};
    const metadataItems = [];
    const errorMetadataItem = [
        null,
        null
    ];
    const treePrefix = undefined;
    return resolveMetadataItemsImpl(metadataItems, tree, treePrefix, parentParams, null, searchParams, errorConvention, errorMetadataItem, interpolatedParams);
});
async function resolveMetadataItemsImpl(metadataItems, tree, /** Provided tree can be nested subtree, this argument says what is the path of such subtree */ treePrefix, parentParams, parentOptionalCatchAllParamName, searchParams, errorConvention, errorMetadataItem, interpolatedParams) {
    const [segment, parallelRoutes, { page }] = tree;
    const currentTreePrefix = treePrefix && treePrefix.length ? [
        ...treePrefix,
        segment
    ] : [
        segment
    ];
    const isPage = typeof page !== 'undefined';
    // Handle dynamic segment params.
    let currentParams = parentParams;
    const segmentParam = getSegmentParam(segment);
    if (segmentParam) {
        const value = interpolatedParams[segmentParam.paramName];
        if (value !== null && value !== undefined) {
            currentParams = {
                ...parentParams,
                [segmentParam.paramName]: value
            };
        }
    }
    // Track optional catch-all params with no value (see comment in
    // create-component-tree.tsx for full explanation).
    const optionalCatchAllParamName = (segmentParam == null ? void 0 : segmentParam.paramType) === 'optional-catchall' && (interpolatedParams[segmentParam.paramName] === null || interpolatedParams[segmentParam.paramName] === undefined) ? segmentParam.paramName : parentOptionalCatchAllParamName;
    const params = createServerParamsForMetadata(currentParams, optionalCatchAllParamName);
    const props = isPage ? {
        params,
        searchParams
    } : {
        params
    };
    await collectMetadata({
        tree,
        metadataItems,
        errorMetadataItem,
        errorConvention,
        props,
        route: currentTreePrefix// __PAGE__ shouldn't be shown in a route
        .filter((s)=>s !== PAGE_SEGMENT_KEY).join('/')
    });
    for(const key in parallelRoutes){
        const childTree = parallelRoutes[key];
        await resolveMetadataItemsImpl(metadataItems, childTree, currentTreePrefix, currentParams, optionalCatchAllParamName, searchParams, errorConvention, errorMetadataItem, interpolatedParams);
    }
    if (Object.keys(parallelRoutes).length === 0 && errorConvention) {
        // If there are no parallel routes, place error metadata as the last item.
        // e.g. layout -> layout -> not-found
        metadataItems.push(errorMetadataItem);
    }
    return metadataItems;
}
const resolveViewportItems = cache(async function(tree, searchParams, errorConvention, interpolatedParams) {
    const parentParams = {};
    const viewportItems = [];
    const errorViewportItemRef = {
        current: null
    };
    const treePrefix = undefined;
    return resolveViewportItemsImpl(viewportItems, tree, treePrefix, parentParams, null, searchParams, errorConvention, errorViewportItemRef, interpolatedParams);
});
async function resolveViewportItemsImpl(viewportItems, tree, /** Provided tree can be nested subtree, this argument says what is the path of such subtree */ treePrefix, parentParams, parentOptionalCatchAllParamName, searchParams, errorConvention, errorViewportItemRef, interpolatedParams) {
    const [segment, parallelRoutes, { page }] = tree;
    const currentTreePrefix = treePrefix && treePrefix.length ? [
        ...treePrefix,
        segment
    ] : [
        segment
    ];
    const isPage = typeof page !== 'undefined';
    // Handle dynamic segment params.
    let currentParams = parentParams;
    const segmentParam = getSegmentParam(segment);
    if (segmentParam) {
        const value = interpolatedParams[segmentParam.paramName];
        if (value !== null && value !== undefined) {
            currentParams = {
                ...parentParams,
                [segmentParam.paramName]: value
            };
        }
    }
    // Track optional catch-all params with no value (see comment in
    // create-component-tree.tsx for full explanation).
    const optionalCatchAllParamName = (segmentParam == null ? void 0 : segmentParam.paramType) === 'optional-catchall' && (interpolatedParams[segmentParam.paramName] === null || interpolatedParams[segmentParam.paramName] === undefined) ? segmentParam.paramName : parentOptionalCatchAllParamName;
    const params = createServerParamsForMetadata(currentParams, optionalCatchAllParamName);
    let layerProps;
    if (isPage) {
        layerProps = {
            params,
            searchParams
        };
    } else {
        layerProps = {
            params
        };
    }
    await collectViewport({
        tree,
        viewportItems,
        errorViewportItemRef,
        errorConvention,
        props: layerProps,
        route: currentTreePrefix// __PAGE__ shouldn't be shown in a route
        .filter((s)=>s !== PAGE_SEGMENT_KEY).join('/')
    });
    for(const key in parallelRoutes){
        const childTree = parallelRoutes[key];
        await resolveViewportItemsImpl(viewportItems, childTree, currentTreePrefix, currentParams, optionalCatchAllParamName, searchParams, errorConvention, errorViewportItemRef, interpolatedParams);
    }
    if (Object.keys(parallelRoutes).length === 0 && errorConvention) {
        // If there are no parallel routes, place error metadata as the last item.
        // e.g. layout -> layout -> not-found
        viewportItems.push(errorViewportItemRef.current);
    }
    return viewportItems;
}
function prerenderMetadata(metadataItems) {
    // If the index is a function then it is a resolver and the next slot
    // is the corresponding result. If the index is not a function it is the result
    // itself.
    const resolversAndResults = [];
    for(let i = 0; i < metadataItems.length; i++){
        const metadataExport = metadataItems[i][0];
        getResult(resolversAndResults, metadataExport);
    }
    return resolversAndResults;
}
function prerenderViewport(viewportItems) {
    // If the index is a function then it is a resolver and the next slot
    // is the corresponding result. If the index is not a function it is the result
    // itself.
    const resolversAndResults = [];
    for(let i = 0; i < viewportItems.length; i++){
        const viewportExport = viewportItems[i];
        getResult(resolversAndResults, viewportExport);
    }
    return resolversAndResults;
}
const noop = ()=>{};
function getResult(resolversAndResults, exportForResult) {
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
        const useCacheFunctionInfo = getUseCacheFunctionInfo(exportForResult.$$original);
        if (useCacheFunctionInfo && useCacheFunctionInfo.usedArgs[1]) {
            const promise = new Promise((resolve)=>resolversAndResults.push(resolve));
            resolversAndResults.push(createLazyResult(async ()=>exportForResult(promise)));
        } else {
            let result;
            if (useCacheFunctionInfo) {
                resolversAndResults.push(noop);
                // @ts-expect-error We intentionally omit the parent argument, because
                // we know from the check above that the 'use cache' function does not
                // use it.
                result = exportForResult();
            } else {
                result = exportForResult(new Promise((resolve)=>resolversAndResults.push(resolve)));
            }
            resolversAndResults.push(result);
            if (result instanceof Promise) {
                // since we eager execute generateMetadata and
                // they can reject at anytime we need to ensure
                // we attach the catch handler right away to
                // prevent unhandled rejections crashing the process
                result.catch((err)=>{
                    return {
                        __nextError: err
                    };
                });
            }
        }
    } else if (typeof exportForResult === 'object') {
        resolversAndResults.push(exportForResult);
    } else {
        resolversAndResults.push(null);
    }
}
function freezeInDev(obj) {
    if (process.env.NODE_ENV === 'development') {
        return require('../../shared/lib/deep-freeze').deepFreeze(obj);
    }
    return obj;
}
export async function accumulateMetadata(route, metadataItems, pathname, metadataContext) {
    let resolvedMetadata = createDefaultMetadata();
    let titleTemplates = {
        title: null,
        twitter: null,
        openGraph: null
    };
    const buildState = {
        warnings: new Set()
    };
    let favicon;
    // Collect the static icons in the most leaf node,
    // since we don't collect all the static metadata icons in the parent segments.
    const leafSegmentStaticIcons = {
        icon: [],
        apple: []
    };
    const resolversAndResults = prerenderMetadata(metadataItems);
    let resultIndex = 0;
    for(let i = 0; i < metadataItems.length; i++){
        var _staticFilesMetadata_icon;
        const staticFilesMetadata = metadataItems[i][1];
        // Treat favicon as special case, it should be the first icon in the list
        // i <= 1 represents root layout, and if current page is also at root
        if (i <= 1 && isFavicon(staticFilesMetadata == null ? void 0 : (_staticFilesMetadata_icon = staticFilesMetadata.icon) == null ? void 0 : _staticFilesMetadata_icon[0])) {
            var _staticFilesMetadata_icon1;
            const iconMod = staticFilesMetadata == null ? void 0 : (_staticFilesMetadata_icon1 = staticFilesMetadata.icon) == null ? void 0 : _staticFilesMetadata_icon1.shift();
            if (i === 0) favicon = iconMod;
        }
        let pendingMetadata = resolversAndResults[resultIndex++];
        if (typeof pendingMetadata === 'function') {
            // This metadata item had a `generateMetadata` and
            // we need to provide the currently resolved metadata
            // to it before we continue;
            const resolveParentMetadata = pendingMetadata;
            // we know that the next item is a result if this item
            // was a resolver
            pendingMetadata = resolversAndResults[resultIndex++];
            resolveParentMetadata(freezeInDev(resolvedMetadata));
        }
        // Otherwise the item was either null or a static export
        let metadata;
        if (isPromiseLike(pendingMetadata)) {
            metadata = await pendingMetadata;
        } else {
            metadata = pendingMetadata;
        }
        resolvedMetadata = await mergeMetadata(route, pathname, {
            resolvedMetadata,
            metadata,
            metadataContext,
            staticFilesMetadata,
            titleTemplates,
            buildState,
            leafSegmentStaticIcons
        });
        // If the layout is the same layer with page, skip the leaf layout and leaf page
        // The leaf layout and page are the last two items
        if (i < metadataItems.length - 2) {
            var _resolvedMetadata_title, _resolvedMetadata_openGraph, _resolvedMetadata_twitter;
            titleTemplates = {
                title: ((_resolvedMetadata_title = resolvedMetadata.title) == null ? void 0 : _resolvedMetadata_title.template) || null,
                openGraph: ((_resolvedMetadata_openGraph = resolvedMetadata.openGraph) == null ? void 0 : _resolvedMetadata_openGraph.title.template) || null,
                twitter: ((_resolvedMetadata_twitter = resolvedMetadata.twitter) == null ? void 0 : _resolvedMetadata_twitter.title.template) || null
            };
        }
    }
    if (leafSegmentStaticIcons.icon.length > 0 || leafSegmentStaticIcons.apple.length > 0) {
        if (!resolvedMetadata.icons) {
            resolvedMetadata.icons = {
                icon: [],
                apple: []
            };
            if (leafSegmentStaticIcons.icon.length > 0) {
                resolvedMetadata.icons.icon.unshift(...leafSegmentStaticIcons.icon);
            }
            if (leafSegmentStaticIcons.apple.length > 0) {
                resolvedMetadata.icons.apple.unshift(...leafSegmentStaticIcons.apple);
            }
        }
    }
    // Only log warnings if there are any, and only once after the metadata resolving process is finished
    if (buildState.warnings.size > 0) {
        for (const warning of buildState.warnings){
            Log.warn(warning);
        }
    }
    return postProcessMetadata(resolvedMetadata, favicon, titleTemplates, metadataContext);
}
export async function accumulateViewport(viewportItems) {
    let resolvedViewport = createDefaultViewport();
    const resolversAndResults = prerenderViewport(viewportItems);
    let i = 0;
    while(i < resolversAndResults.length){
        let pendingViewport = resolversAndResults[i++];
        if (typeof pendingViewport === 'function') {
            // this viewport item had a `generateViewport` and
            // we need to provide the currently resolved viewport
            // to it before we continue;
            const resolveParentViewport = pendingViewport;
            // we know that the next item is a result if this item
            // was a resolver
            pendingViewport = resolversAndResults[i++];
            resolveParentViewport(freezeInDev(resolvedViewport));
        }
        // Otherwise the item was either null or a static export
        let viewport;
        if (isPromiseLike(pendingViewport)) {
            viewport = await pendingViewport;
        } else {
            viewport = pendingViewport;
        }
        resolvedViewport = mergeViewport({
            resolvedViewport,
            viewport
        });
    }
    return resolvedViewport;
}
// Exposed API for metadata component, that directly resolve the loader tree and related context as resolved metadata.
export async function resolveMetadata(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext) {
    const metadataItems = await resolveMetadataItems(tree, searchParams, errorConvention, interpolatedParams);
    const workStore = workAsyncStorage.getStore();
    if (!workStore) {
        throw new InvariantError('Expected workStore to be initialized');
    }
    return accumulateMetadata(workStore.route, metadataItems, pathname, metadataContext);
}
// Exposed API for viewport component, that directly resolve the loader tree and related context as resolved viewport.
export async function resolveViewport(tree, searchParams, errorConvention, interpolatedParams) {
    const viewportItems = await resolveViewportItems(tree, searchParams, errorConvention, interpolatedParams);
    return accumulateViewport(viewportItems);
}
function isPromiseLike(value) {
    return typeof value === 'object' && value !== null && typeof value.then === 'function';
}

//# sourceMappingURL=resolve-metadata.js.map