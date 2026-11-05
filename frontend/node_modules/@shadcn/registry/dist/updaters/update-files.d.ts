import { Config } from '../get-config.js';
import { ProjectInfo } from '../get-project-info.js';
import { RegistryItem } from '../registry/schema.js';
import { spinner } from '../spinner.js';
import { loadConfig } from 'tsconfig-paths';
export { findCommonRoot, resolveFilePath, resolveNestedFilePath, resolvePageTarget } from '../resolve-file-path.js';
import '../json-config.js';
import '../preset/preset.js';
import 'zod';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';
import 'ora';

declare function updateFiles(files: RegistryItem["files"], config: Config, options: {
    overwrite?: boolean;
    force?: boolean;
    silent?: boolean;
    interactive?: boolean;
    rootSpinner?: ReturnType<typeof spinner>;
    isRemote?: boolean;
    isWorkspace?: boolean;
    path?: string;
    plannedFiles?: RegistryItem["files"];
    supportedFontMarkers?: string[];
}): Promise<{
    filesCreated: string[];
    filesUpdated: string[];
    filesSkipped: string[];
}>;
declare function getPlannedFilePaths(files: RegistryItem["files"], config: Config, options: {
    isSrcDir?: boolean;
    framework?: ProjectInfo["framework"]["name"];
    path?: string;
}): string[];
declare function rewriteResolvedImportsInContent({ content, resolvedPath, filePaths, config, projectInfo, tsConfig, }: {
    content: string;
    resolvedPath: string;
    filePaths: string[];
    config: Config;
    projectInfo: ProjectInfo | null;
    tsConfig: ReturnType<typeof loadConfig>;
    /** @deprecated Ignored: imports are no longer rewritten with ts-morph. */
    project?: unknown;
}): Promise<string>;
/**
 * Given an absolute "probable" import path (no ext),
 * plus an array of absolute file paths you already know about,
 * return 0–N matches (best match first), and also check disk for any missing ones.
 */
declare function resolveModuleByProbablePath(probableImportFilePath: string, files: string[], config: Config, extensions?: string[]): string | null;
declare function toAliasedImport(filePath: string, config: Config, projectInfo: ProjectInfo, importerPath?: string): string | null;

export { getPlannedFilePaths, resolveModuleByProbablePath, rewriteResolvedImportsInContent, toAliasedImport, updateFiles };
