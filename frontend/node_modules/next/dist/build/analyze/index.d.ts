import { type SnapshotMetadata } from './snapshot';
export type AnalyzeOptions = {
    dir: string;
    reactProductionProfiling?: boolean;
    noMangling?: boolean;
    appDirOnly?: boolean;
    output?: boolean;
    port?: number;
    /** Reusing an explicit name replaces its retained snapshot. */
    snapshot?: string;
};
export default function analyze({ dir, reactProductionProfiling, noMangling, appDirOnly, output, port, snapshot, }: AnalyzeOptions): Promise<SnapshotMetadata>;
