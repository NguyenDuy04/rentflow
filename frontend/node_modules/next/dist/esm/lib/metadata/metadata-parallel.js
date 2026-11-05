import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { Suspense, cache } from 'react';
import { createServerSearchParamsForMetadata } from '../../server/request/search-params';
import { createServerPathnameForMetadata } from '../../server/request/pathname';
import { resolveMetadataForBranch, resolveMetadataResolution, resolveViewportForBranch } from './resolve-metadata-parallel';
import { createMetadataElements, createViewportElements } from './metadata-elements';
import { MetadataBoundary, ViewportBoundary, OutletBoundary } from '../framework/boundary-components';
export function createMetadataComponents({ tree, pathname, parsedQuery, metadataContext, interpolatedParams, errorType, serveStreamingMetadata }) {
    const searchParams = createServerSearchParamsForMetadata(parsedQuery);
    const pathnameForMetadata = createServerPathnameForMetadata(pathname);
    async function Viewport() {
        const tags = await getMetadataResolution(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType).then(async (resolution)=>{
            const selected = await resolution.selectedViewport;
            if (selected.status === 'resolved') {
                return /*#__PURE__*/ _jsx(_Fragment, {
                    children: createViewportElements(selected.value)
                });
            }
            if (!errorType && (selected.status === 'not-found' || selected.status === 'forbidden' || selected.status === 'unauthorized')) {
                const convention = await getViewportForBranch(tree, pathnameForMetadata, searchParams, selected.status, interpolatedParams, metadataContext, resolution.selectedKeyPath);
                if (convention.status === 'resolved') {
                    return /*#__PURE__*/ _jsx(_Fragment, {
                        children: createViewportElements(convention.value)
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
        return /*#__PURE__*/ _jsx(ViewportBoundary, {
            children: /*#__PURE__*/ _jsx(Viewport, {})
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
        return /*#__PURE__*/ _jsxs(MetadataBoundary, {
            children: [
                /*#__PURE__*/ _jsx("div", {
                    hidden: true,
                    children: /*#__PURE__*/ _jsx(Suspense, {
                        name: "Next.Metadata",
                        children: /*#__PURE__*/ _jsx(Metadata, {})
                    })
                }),
                /*#__PURE__*/ _jsx(MetadataBlocker, {})
            ]
        });
    }
    function MetadataOutlet({ tree: outletTree }) {
        const metadataResolution = getMetadataResolution(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType);
        const pendingOutlet = metadataResolution.then((resolution)=>resolution.outlets.get(outletTree) ?? null);
        if (!serveStreamingMetadata) {
            return /*#__PURE__*/ _jsx(OutletBoundary, {
                children: pendingOutlet
            });
        }
        return /*#__PURE__*/ _jsx(OutletBoundary, {
            children: /*#__PURE__*/ _jsx(Suspense, {
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
const getResolvedParallelMetadata = cache(getResolvedParallelMetadataImpl);
async function getResolvedParallelMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const resolution = await getMetadataResolution(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType);
    const selected = await resolution.selectedMetadata;
    if (selected.status === 'resolved') {
        return /*#__PURE__*/ _jsx(_Fragment, {
            children: createMetadataElements(selected.value)
        });
    }
    if (!errorType && (selected.status === 'not-found' || selected.status === 'forbidden' || selected.status === 'unauthorized')) {
        const convention = await getMetadataForBranch(tree, pathname, searchParams, selected.status, interpolatedParams, metadataContext, resolution.selectedKeyPath);
        if (convention.status === 'resolved') {
            return /*#__PURE__*/ _jsx(_Fragment, {
                children: createMetadataElements(convention.value)
            });
        }
    }
    return null;
}
const getMetadataResolution = cache(resolveMetadataResolutionImpl);
async function resolveMetadataResolutionImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return resolveMetadataResolution(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext);
}
const getMetadataForBranch = cache(resolveMetadataForBranch);
const getViewportForBranch = cache(resolveViewportForBranch);

//# sourceMappingURL=metadata-parallel.js.map