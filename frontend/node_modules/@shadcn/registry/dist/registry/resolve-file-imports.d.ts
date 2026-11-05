import { ProjectInfo } from '../get-project-info.js';
import { configSchema, registryItemSchema } from './schema.js';
import { z } from 'zod';
import '../frameworks.js';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import '../get-package-info.js';
import 'type-fest';

declare function getDependencyFromModuleSpecifier(moduleSpecifier: string): string | null;
declare function recursivelyResolveFileImports(filePath: string, config: z.infer<typeof configSchema>, projectInfo: ProjectInfo, processedFiles?: Set<string>): Promise<Pick<z.infer<typeof registryItemSchema>, "files" | "dependencies">>;

export { getDependencyFromModuleSpecifier, recursivelyResolveFileImports };
