import { z } from 'next/dist/compiled/zod';
export declare const snapshotNameSchema: z.ZodEffects<z.ZodString, string, string>;
/** On-disk metadata, mirrored by the analyzer UI. Names are the only snapshot keys. */
export declare const snapshotMetadataSchema: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
    createdAt: z.ZodString;
    nextVersion: z.ZodOptional<z.ZodString>;
    gitBranch: z.ZodOptional<z.ZodString>;
    gitSha: z.ZodOptional<z.ZodString>;
    gitShortSha: z.ZodOptional<z.ZodString>;
    gitDirty: z.ZodOptional<z.ZodBoolean>;
    gitMessage: z.ZodOptional<z.ZodString>;
    appDirOnly: z.ZodOptional<z.ZodBoolean>;
    noMangling: z.ZodOptional<z.ZodBoolean>;
    routeCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    createdAt: string;
    routeCount: number;
    nextVersion?: string | undefined;
    appDirOnly?: boolean | undefined;
    noMangling?: boolean | undefined;
    gitBranch?: string | undefined;
    gitSha?: string | undefined;
    gitShortSha?: string | undefined;
    gitDirty?: boolean | undefined;
    gitMessage?: string | undefined;
}, {
    name: string;
    createdAt: string;
    routeCount: number;
    nextVersion?: string | undefined;
    appDirOnly?: boolean | undefined;
    noMangling?: boolean | undefined;
    gitBranch?: string | undefined;
    gitSha?: string | undefined;
    gitShortSha?: string | undefined;
    gitDirty?: boolean | undefined;
    gitMessage?: string | undefined;
}>;
export type SnapshotMetadata = z.infer<typeof snapshotMetadataSchema>;
export interface CurrentSnapshotIndex {
    metadata: SnapshotMetadata;
}
export declare const historyIndexSchema: z.ZodObject<{
    snapshots: z.ZodArray<z.ZodObject<{
        name: z.ZodEffects<z.ZodString, string, string>;
        createdAt: z.ZodString;
        nextVersion: z.ZodOptional<z.ZodString>;
        gitBranch: z.ZodOptional<z.ZodString>;
        gitSha: z.ZodOptional<z.ZodString>;
        gitShortSha: z.ZodOptional<z.ZodString>;
        gitDirty: z.ZodOptional<z.ZodBoolean>;
        gitMessage: z.ZodOptional<z.ZodString>;
        appDirOnly: z.ZodOptional<z.ZodBoolean>;
        noMangling: z.ZodOptional<z.ZodBoolean>;
        routeCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        createdAt: string;
        routeCount: number;
        nextVersion?: string | undefined;
        appDirOnly?: boolean | undefined;
        noMangling?: boolean | undefined;
        gitBranch?: string | undefined;
        gitSha?: string | undefined;
        gitShortSha?: string | undefined;
        gitDirty?: boolean | undefined;
        gitMessage?: string | undefined;
    }, {
        name: string;
        createdAt: string;
        routeCount: number;
        nextVersion?: string | undefined;
        appDirOnly?: boolean | undefined;
        noMangling?: boolean | undefined;
        gitBranch?: string | undefined;
        gitSha?: string | undefined;
        gitShortSha?: string | undefined;
        gitDirty?: boolean | undefined;
        gitMessage?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    snapshots: {
        name: string;
        createdAt: string;
        routeCount: number;
        nextVersion?: string | undefined;
        appDirOnly?: boolean | undefined;
        noMangling?: boolean | undefined;
        gitBranch?: string | undefined;
        gitSha?: string | undefined;
        gitShortSha?: string | undefined;
        gitDirty?: boolean | undefined;
        gitMessage?: string | undefined;
    }[];
}, {
    snapshots: {
        name: string;
        createdAt: string;
        routeCount: number;
        nextVersion?: string | undefined;
        appDirOnly?: boolean | undefined;
        noMangling?: boolean | undefined;
        gitBranch?: string | undefined;
        gitSha?: string | undefined;
        gitShortSha?: string | undefined;
        gitDirty?: boolean | undefined;
        gitMessage?: string | undefined;
    }[];
}>;
export type HistoryIndex = z.infer<typeof historyIndexSchema>;
/** Encode names into one portable path segment, including dots and reserved names. */
export declare function snapshotDirectory(name: string): string;
/**
 * Read the analyzer's routes from `route-summaries.json` in a live `data/`
 * directory or a saved snapshot.
 *
 * Turbopack writes one summary per route it wrote `analyze.data` for, keyed by
 * the directory that data lives in. It is the only route index: the routes
 * manifest names differ for metadata routes using `generateImageMetadata` or
 * `generateSitemaps` (`/icon/[__metadata_id__]` vs. the stored `/icon`).
 */
export declare function readAnalyzeRoutes(directory: string): string[];
interface BuildSnapshotInputs {
    projectDir: string;
    analyzeDir: string;
    routes: string[];
    appDirOnly?: boolean;
    noMangling?: boolean;
    /** An explicit name replaces that retained snapshot; omission generates a unique name. */
    snapshot?: string;
    maxHistory?: number;
}
/** Save the current analysis and refresh the rolling, newest-first history. */
export declare function writeAnalyzeSnapshot({ projectDir, analyzeDir, routes, appDirOnly, noMangling, snapshot, maxHistory, }: BuildSnapshotInputs): SnapshotMetadata;
export {};
