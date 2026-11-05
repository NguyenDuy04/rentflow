import { ImportEmitMode } from './import-matcher.js';
import { ConfigLoaderSuccessResult } from 'tsconfig-paths';

type ResolvedImport = {
    path: string;
    source: "tsconfig_paths" | "package_imports" | "workspace_package_exports";
    matchedAlias: string;
    matchedTarget: string;
    emitMode: ImportEmitMode;
};
type ResolveImportConfig = Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths"> & {
    cwd?: string;
};
declare function resolveImportWithMetadata(importPath: string, config: ResolveImportConfig): Promise<{
    path: string;
    source: string;
    matchedAlias: string;
    matchedTarget: string;
    emitMode: string;
} | null>;
declare function resolveImport(importPath: string, config: ResolveImportConfig): Promise<string | null>;
declare function isLocalAliasImport(moduleSpecifier: string, aliasPrefix: string | null): boolean;

export { type ResolvedImport, isLocalAliasImport, resolveImport, resolveImportWithMetadata };
