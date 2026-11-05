import { ImportResolutionMatch, ImportEmitMode } from './import-matcher.js';

type WorkspacePackageExportMatch = ImportResolutionMatch;
declare function resolveWorkspacePackageExport(importPath: string, cwd: string): Promise<{
    path: string;
    matchedAlias: string;
    matchedTarget: string;
    emitMode: ImportEmitMode;
} | null>;

export { type WorkspacePackageExportMatch, resolveWorkspacePackageExport };
