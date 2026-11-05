import type { ComponentType } from 'react';
import { type PrefetchHints } from '../../shared/lib/app-router-types';
import type { FullTransportNode, PartialTransportNode } from '../../shared/lib/rsc-transport';
import type { PreloadCallbacks } from './types';
import type { LoaderTree } from '../lib/app-dir-module';
import type { AppRenderContext, GetDynamicParamFromSegment } from './app-render';
import type { Params } from '../request/params';
type CreateComponentTreeProps = {
    loaderTree: LoaderTree;
    parentParams: Params;
    parentOptionalCatchAllParamName: string | null;
    parentRuntimePrefetchable: false;
    rootLayoutIncluded: boolean;
    injectedCSS: Set<string>;
    injectedJS: Set<string>;
    injectedFontPreloadTags: Set<string>;
    ctx: AppRenderContext;
    missingSlots?: Set<string>;
    preloadCallbacks: PreloadCallbacks;
    authInterrupts: boolean;
    MetadataOutlet: ComponentType<{
        tree: LoaderTree;
    }>;
    isPrerendering: boolean;
    hintTree: PrefetchHints | null;
};
/**
 * Use the provided loader tree to create the React Component tree, returned
 * as the response's transport tree: each node carries its segment identity,
 * its prefetch hints, and its render output.
 */
export declare function createComponentTree(props: CreateComponentTreeProps): Promise<PartialTransportNode>;
/**
 * Variant of createComponentTree for full renders — the initial document
 * (and error) payloads, which are never prefetches. No subtree is cut at a
 * loading boundary, so every node carries its render output, which is what
 * FullTransportNode requires. TypeScript can't see through that invariant,
 * hence the cast.
 */
export declare function createFullComponentTree(props: CreateComponentTreeProps): Promise<FullTransportNode>;
export declare function getRootParams(loaderTree: LoaderTree, getDynamicParamFromSegment: GetDynamicParamFromSegment): Params;
export {};
