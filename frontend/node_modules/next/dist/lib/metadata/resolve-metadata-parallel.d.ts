import type { ResolvedViewport } from './types/metadata-interface';
import type { MetadataContext } from './types/resolvers';
import type { LoaderTree } from '../../server/lib/app-dir-module';
import type { ParsedUrlQuery } from 'querystring';
import type { Params } from '../../server/request/params';
import 'server-only';
import { type MetadataErrorType, type SelectedMetadata } from './metadata-resolution-primitives';
type RejectedMetadataResolutionStatus = MetadataErrorType | 'redirect' | 'error';
type ResolvedOutcome<T> = {
    status: 'resolved';
    value: T;
};
type RejectedOutcome = {
    status: RejectedMetadataResolutionStatus;
    reason: unknown;
};
type ResolutionOutcome<T> = ResolvedOutcome<T> | RejectedOutcome;
type MetadataBranchOutcome = (ResolvedOutcome<SelectedMetadata> & {
    warnings: Set<string>;
}) | RejectedOutcome;
type ViewportBranchOutcome = ResolutionOutcome<ResolvedViewport>;
type MetadataResolution = {
    selectedKeyPath: string[];
    selectedMetadata: Promise<MetadataBranchOutcome>;
    selectedViewport: Promise<ViewportBranchOutcome>;
    outlets: Map<LoaderTree, Promise<null>>;
};
export declare function resolveMetadataResolution(tree: LoaderTree, pathname: Promise<string>, searchParams: Promise<ParsedUrlQuery>, errorConvention: MetadataErrorType | undefined, interpolatedParams: Params, metadataContext: MetadataContext): Promise<MetadataResolution>;
export declare function resolveMetadataForBranch(tree: LoaderTree, pathname: Promise<string>, searchParams: Promise<ParsedUrlQuery>, errorConvention: MetadataErrorType, interpolatedParams: Params, metadataContext: MetadataContext, selectedKeyPath: string[]): Promise<MetadataBranchOutcome>;
export declare function resolveViewportForBranch(tree: LoaderTree, pathname: Promise<string>, searchParams: Promise<ParsedUrlQuery>, errorConvention: MetadataErrorType, interpolatedParams: Params, metadataContext: MetadataContext, selectedKeyPath: string[]): Promise<ViewportBranchOutcome>;
export {};
