import { Config } from './get-config.js';
import { resolveRegistryTree } from './registry/resolver.js';
import { registryItemFileSchema } from './registry/schema.js';
import { z } from 'zod';
import './json-config.js';
import './preset/preset.js';

interface AddComponentsOptions {
    overwrite?: boolean;
    overwriteCssVars?: boolean;
    silent?: boolean;
    interactive?: boolean;
    resolvedTree?: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>;
    isNewProject?: boolean;
    skipFonts?: boolean;
    registryHeaders?: Record<string, Record<string, string>>;
    path?: string;
}
declare function addComponents(components: string[], config: Config, options: AddComponentsOptions): Promise<void>;
declare function validateFilesTarget(files: z.infer<typeof registryItemFileSchema>[], cwd: string): void;

export { type AddComponentsOptions, addComponents, validateFilesTarget };
