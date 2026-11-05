import { ImportResolutionEntry, ImportResolutionMatch, ImportEmitMode } from './import-matcher.js';

type PackageImportEntry = ImportResolutionEntry;
type PackageImportMatch = ImportResolutionMatch;
declare function getPackageImportEntries(cwd: string): ImportResolutionEntry[];
declare function getPackageImportPrefix(cwd: string): string | null;
declare function resolvePackageImport(importPath: string, cwd: string): {
    path: string;
    matchedAlias: string;
    matchedTarget: string;
    emitMode: ImportEmitMode;
} | null;
declare function getPackageImportAliases(cwd: string): {
    components: string;
    ui: string;
    lib: string;
    hooks: string;
    utils: string;
};

export { ImportEmitMode, type PackageImportEntry, type PackageImportMatch, getPackageImportAliases, getPackageImportEntries, getPackageImportPrefix, resolvePackageImport };
