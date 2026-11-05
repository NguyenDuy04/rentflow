#!/usr/bin/env node
import '../server/lib/cpu-profile';
export type NextAnalyzeOptions = {
    experimentalAnalyze?: boolean;
    profile?: boolean;
    mangling: boolean;
    port: number;
    output: boolean;
    experimentalAppOnly?: boolean;
    snapshot?: string;
};
export type NextAnalyzeExportOptions = {
    distDir?: string;
    snapshot?: string;
    route?: string;
};
declare function nextAnalyzeExport(options: NextAnalyzeExportOptions, directory?: string): void;
declare const nextAnalyze: (options: NextAnalyzeOptions, directory?: string) => Promise<void>;
export { nextAnalyze, nextAnalyzeExport };
