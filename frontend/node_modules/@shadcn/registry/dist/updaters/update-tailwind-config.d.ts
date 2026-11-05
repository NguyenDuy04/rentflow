import { ParseOptions } from '../codemod/parse.js';
import { Config } from '../get-config.js';
import { TailwindVersion } from '../get-project-info.js';
import { registryItemTailwindSchema } from '../registry/schema.js';
import { types } from '@babel/core';
import { z } from 'zod';
export { buildTailwindThemeColorsFromCssVars } from '../tailwind-theme-colors.js';
import '@babel/parser';
import '../json-config.js';
import '../preset/preset.js';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

type TailwindConfig = {
    [key: string]: any;
    [key: number]: any;
};
type UpdaterTailwindConfig = Omit<TailwindConfig, "plugins"> & {
    plugins?: string[];
};
declare function updateTailwindConfig(tailwindConfig: z.infer<typeof registryItemTailwindSchema>["config"] | undefined, config: Config, options: {
    silent?: boolean;
    tailwindVersion?: TailwindVersion;
    workspaceRoot?: string;
}): Promise<string | undefined>;
declare function transformTailwindConfig(input: string, tailwindConfig: UpdaterTailwindConfig, config: Config): Promise<string>;
declare function nestSpreadProperties(code: string, object: types.ObjectExpression, options: ParseOptions): string;
declare function nestSpreadElements(code: string, array: types.ArrayExpression, options: ParseOptions): string;
declare function unnestSpreadProperties(code: string, object: types.ObjectExpression, options: ParseOptions): string;
declare function unnestSpreadElements(code: string, array: types.ArrayExpression, options: ParseOptions): string;

export { type UpdaterTailwindConfig, nestSpreadElements, nestSpreadProperties, transformTailwindConfig, unnestSpreadElements, unnestSpreadProperties, updateTailwindConfig };
