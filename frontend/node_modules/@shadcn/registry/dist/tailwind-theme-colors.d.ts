import { registryItemCssVarsSchema } from './registry/schema.js';
import { z } from 'zod';

declare function buildTailwindThemeColorsFromCssVars(cssVars: z.infer<typeof registryItemCssVarsSchema>): Record<string, any>;

export { buildTailwindThemeColorsFromCssVars };
