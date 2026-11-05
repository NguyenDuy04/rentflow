import { Config } from '../get-config.js';
import { TailwindVersion } from '../get-project-info.js';
import { registryItemCssSchema, registryItemCssVarsSchema, registryItemTailwindSchema } from '../registry/schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

declare function updateCss(css: z.infer<typeof registryItemCssSchema> | undefined, config: Config, options: {
    silent?: boolean;
    cssVars?: z.infer<typeof registryItemCssVarsSchema>;
    cleanupDefaultNextStyles?: boolean;
    overwriteCssVars?: boolean;
    tailwindVersion?: TailwindVersion;
    tailwindConfig?: z.infer<typeof registryItemTailwindSchema>["config"];
}): Promise<void>;
declare function transformCss(input: string, css: z.infer<typeof registryItemCssSchema>): Promise<string>;

export { transformCss, updateCss };
