import type { Metadata, ResolvedMetadata, ResolvedViewport, Viewport, WithStringifiedURLs } from './types/metadata-interface';
import type { AppDirModules } from '../../build/webpack/loaders/next-app-loader';
import type { MetadataContext } from './types/resolvers';
import type { AbsoluteTemplateString, IconDescriptor, ResolvedIcons } from './types/metadata-types';
import type { StaticMetadata } from './types/icons';
import type { Params } from '../../server/request/params';
import type { SearchParams } from '../../server/request/search-params';
import 'server-only';
import type { UseCacheLayoutProps, UseCachePageProps } from '../../server/use-cache/use-cache-wrapper';
export type StaticIcons = Pick<ResolvedIcons, 'icon' | 'apple'>;
export type InstrumentedResolver<TData, TResolved> = ((parent: Promise<TResolved>) => TData | Promise<TData>) & {
    $$original: (props: unknown, parent: Promise<TResolved>) => TData | Promise<TData>;
};
export type MetadataResolver = InstrumentedResolver<Metadata, ResolvedMetadata>;
export type ViewportResolver = InstrumentedResolver<Viewport, ResolvedViewport>;
export type MetadataErrorType = 'not-found' | 'forbidden' | 'unauthorized';
export type MetadataItems = Array<[
    Metadata | MetadataResolver | null,
    StaticMetadata
]>;
export type ViewportItems = Array<Viewport | ViewportResolver | null>;
type WithSelectedTitle<T> = T extends {
    title: AbsoluteTemplateString;
} ? Omit<T, 'title'> & {
    title: string;
} : T;
/**
 * Metadata that has finished route-level resolution and post-processing. It
 * contains only values that can be turned into metadata elements; it is never
 * used as the parent of another metadata resolver.
 */
export type SelectedMetadata = Omit<ResolvedMetadata, 'metadataBase' | 'title' | 'openGraph' | 'twitter' | 'themeColor' | 'colorScheme' | 'viewport'> & {
    title: string | null;
    openGraph: WithSelectedTitle<NonNullable<ResolvedMetadata['openGraph']>> | null;
    twitter: WithSelectedTitle<NonNullable<ResolvedMetadata['twitter']>> | null;
};
export type TitleTemplates = {
    title: string | null;
    twitter: string | null;
    openGraph: string | null;
};
export type BuildState = {
    warnings: Set<string>;
};
export type LayoutProps = {
    params: Promise<Params>;
};
export type PageProps = {
    params: Promise<Params>;
    searchParams: Promise<SearchParams>;
};
export type SegmentProps = LayoutProps | PageProps;
export type UseCacheSegmentProps = UseCacheLayoutProps | UseCachePageProps;
export declare function isFavicon(icon: IconDescriptor | undefined): boolean;
export declare function convertUrlsToStrings<T>(input: T): WithStringifiedURLs<T>;
/**
 * Merges the given metadata with the resolved metadata. Returns a new object.
 */
export declare function mergeMetadata(route: string, pathname: Promise<string>, { metadata, resolvedMetadata, staticFilesMetadata, titleTemplates, metadataContext, buildState, leafSegmentStaticIcons, cloneResolvedMetadata, }: {
    metadata: Metadata | null;
    resolvedMetadata: ResolvedMetadata;
    staticFilesMetadata: StaticMetadata;
    titleTemplates: TitleTemplates;
    metadataContext: MetadataContext;
    buildState: BuildState;
    leafSegmentStaticIcons: StaticIcons;
    cloneResolvedMetadata?: boolean;
}): Promise<ResolvedMetadata>;
/**
 * Merges the given viewport with the resolved viewport. Returns a new object.
 */
export declare function mergeViewport({ resolvedViewport, viewport, cloneResolvedViewport, }: {
    resolvedViewport: ResolvedViewport;
    viewport: Viewport | null;
    cloneResolvedViewport?: boolean;
}): ResolvedViewport;
export declare function getDefinedViewport(mod: any, props: SegmentProps, tracingProps: {
    route: string;
}): Viewport | ViewportResolver | null;
export declare function getDefinedMetadata(mod: any, props: SegmentProps, tracingProps: {
    route: string;
}): Metadata | MetadataResolver | null;
export declare function resolveStaticMetadata(modules: AppDirModules, props: SegmentProps): Promise<StaticMetadata>;
export declare function postProcessMetadata(metadata: ResolvedMetadata, favicon: any, titleTemplates: TitleTemplates, metadataContext: MetadataContext): ResolvedMetadata;
export declare function createSelectedMetadata(metadata: ResolvedMetadata): SelectedMetadata;
export {};
