import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { Suspense, cache } from 'react';
import { createSelectedMetadata, resolveMetadata, resolveViewport } from './resolve-metadata';
import { isHTTPAccessFallbackError } from '../../client/components/http-access-fallback/http-access-fallback';
import { createServerSearchParamsForMetadata } from '../../server/request/search-params';
import { createServerPathnameForMetadata } from '../../server/request/pathname';
import { MetadataBoundary, ViewportBoundary, OutletBoundary } from '../framework/boundary-components';
import { createMetadataElements, createViewportElements } from './metadata-elements';
// Use a promise to share the status of the metadata resolving,
// returning two components `MetadataTree` and `MetadataOutlet`
// `MetadataTree` is the one that will be rendered at first in the content sequence for metadata tags.
// `MetadataOutlet` is the one that will be rendered under error boundaries for metadata resolving errors.
// In this way we can let the metadata tags always render successfully,
// and the error will be caught by the error boundary and trigger fallbacks.
export function createMetadataComponents({ tree, pathname, parsedQuery, metadataContext, interpolatedParams, errorType, serveStreamingMetadata }) {
    const searchParams = createServerSearchParamsForMetadata(parsedQuery);
    const pathnameForMetadata = createServerPathnameForMetadata(pathname);
    async function Viewport() {
        const tags = await getResolvedViewport(tree, searchParams, interpolatedParams, errorType).catch((viewportErr)=>{
            if (!errorType && isHTTPAccessFallbackError(viewportErr)) {
                return getNotFoundViewport(tree, searchParams, interpolatedParams).catch(()=>null);
            }
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
        return getResolvedMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType).catch((metadataErr)=>{
            if (!errorType && isHTTPAccessFallbackError(metadataErr)) {
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
    function MetadataOutlet() {
        const pendingOutlet = Promise.all([
            getResolvedMetadata(tree, pathnameForMetadata, searchParams, interpolatedParams, metadataContext, errorType),
            getResolvedViewport(tree, searchParams, interpolatedParams, errorType)
        ]).then(()=>null);
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
const getResolvedMetadata = cache(getResolvedMetadataImpl);
async function getResolvedMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, errorConvention);
}
const getNotFoundMetadata = cache(getNotFoundMetadataImpl);
async function getNotFoundMetadataImpl(tree, pathname, searchParams, interpolatedParams, metadataContext) {
    const notFoundErrorConvention = 'not-found';
    return renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, notFoundErrorConvention);
}
const getResolvedViewport = cache(getResolvedViewportImpl);
async function getResolvedViewportImpl(tree, searchParams, interpolatedParams, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderViewport(tree, searchParams, interpolatedParams, errorConvention);
}
const getNotFoundViewport = cache(getNotFoundViewportImpl);
async function getNotFoundViewportImpl(tree, searchParams, interpolatedParams) {
    const notFoundErrorConvention = 'not-found';
    return renderViewport(tree, searchParams, interpolatedParams, notFoundErrorConvention);
}
async function renderMetadata(tree, pathname, searchParams, interpolatedParams, metadataContext, errorConvention) {
    const resolvedMetadata = await resolveMetadata(tree, pathname, searchParams, errorConvention, interpolatedParams, metadataContext);
    return /*#__PURE__*/ _jsx(_Fragment, {
        children: createMetadataElements(createSelectedMetadata(resolvedMetadata))
    });
}
async function renderViewport(tree, searchParams, interpolatedParams, errorConvention) {
    const resolvedViewport = await resolveViewport(tree, searchParams, errorConvention, interpolatedParams);
    return /*#__PURE__*/ _jsx(_Fragment, {
        children: createViewportElements(resolvedViewport)
    });
}

//# sourceMappingURL=metadata.js.map