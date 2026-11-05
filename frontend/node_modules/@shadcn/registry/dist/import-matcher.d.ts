type ImportEmitMode = "strip_extension" | "preserve_extension";
type ImportResolutionEntry = {
    key: string;
    aliasBase: string;
    target: string;
    emitMode: ImportEmitMode;
    hasWildcard: boolean;
    rootDir: string;
};
type ImportResolutionMatch = {
    path: string;
    matchedAlias: string;
    matchedTarget: string;
    emitMode: ImportEmitMode;
};
declare function resolveLocalPathTarget(target: unknown): string | null;
declare function getImportTargetEmitMode(target: string): "strip_extension" | "preserve_extension";
declare function resolveImportEntryMatch(importPath: string, entries: ImportResolutionEntry[]): {
    path: string;
    matchedAlias: string;
    matchedTarget: string;
    emitMode: ImportEmitMode;
} | null;
declare function getPatternWildcardValue(importPath: string, pattern: string, options?: {
    allowBareAliasBase?: boolean;
}): string | null;
declare function applyWildcardTarget(target: string, wildcardValue: string): string;

export { type ImportEmitMode, type ImportResolutionEntry, type ImportResolutionMatch, applyWildcardTarget, getImportTargetEmitMode, getPatternWildcardValue, resolveImportEntryMatch, resolveLocalPathTarget };
