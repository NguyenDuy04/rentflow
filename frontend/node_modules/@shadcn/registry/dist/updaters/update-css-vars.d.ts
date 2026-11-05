import { Config } from '../get-config.js';
import { TailwindVersion } from '../get-project-info.js';
import { registryItemCssVarsSchema, registryItemTailwindSchema } from '../registry/schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

declare function updateCssVars(cssVars: z.infer<typeof registryItemCssVarsSchema> | undefined, config: Config, options: {
    cleanupDefaultNextStyles?: boolean;
    overwriteCssVars?: boolean;
    silent?: boolean;
    tailwindVersion?: TailwindVersion;
    tailwindConfig?: z.infer<typeof registryItemTailwindSchema>["config"];
}): Promise<void>;
declare function transformCssVars(input: string, cssVars: z.infer<typeof registryItemCssVarsSchema>, config: Config, options?: {
    cleanupDefaultNextStyles?: boolean;
    tailwindVersion?: TailwindVersion;
    tailwindConfig?: z.infer<typeof registryItemTailwindSchema>["config"];
    overwriteCssVars?: boolean;
}): Promise<string>;
declare function isLocalHSLValue(value: string): boolean;
declare function isColorValue(value: string): boolean;

export { isColorValue, isLocalHSLValue, transformCssVars, updateCssVars };
