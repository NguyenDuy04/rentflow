import { Config } from '../get-config.js';
import { registryItemFileSchema, registryItemSchema } from './schema.js';
import { z } from 'zod';
export { getDependencyFromModuleSpecifier, recursivelyResolveFileImports } from './resolve-file-imports.js';
import '../json-config.js';
import '../preset/preset.js';
import '../get-project-info.js';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

declare function isUrl(path: string): boolean;
declare function isLocalFile(path: string): boolean;
/**
 * Check if a registry item is universal (framework-agnostic).
 * A universal registry item must:
 * 1. Have type "registry:item" or "registry:file"
 * 2. If it has files, all files must have explicit targets and be type "registry:file" or "registry:item"
 * It can be installed without framework detection or a full project config.
 */
declare function isUniversalRegistryItem(registryItem: Pick<z.infer<typeof registryItemSchema>, "files" | "type"> | null | undefined): boolean;
declare function deduplicateFilesByTarget(filesArrays: Array<z.infer<typeof registryItemFileSchema>[] | undefined>, config: Config): Promise<({
    path: string;
    type: "registry:file" | "registry:page";
    target: string;
    content?: string | undefined;
} | {
    path: string;
    type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
    content?: string | undefined;
    target?: string | undefined;
})[]>;
declare function canDeduplicateFiles(config: Config): boolean;

export { canDeduplicateFiles, deduplicateFilesByTarget, isLocalFile, isUniversalRegistryItem, isUrl };
