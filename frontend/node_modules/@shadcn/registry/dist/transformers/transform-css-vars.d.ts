import { registryBaseColorSchema } from '../registry/schema.js';
import { Transformer } from './index.js';
import { z } from 'zod';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';

declare const transformCssVars: Transformer;
declare function splitClassName(className: string): (string | null)[];
declare function applyColorMapping(input: string, mapping: z.infer<typeof registryBaseColorSchema>["inlineColors"]): string;

export { applyColorMapping, splitClassName, transformCssVars };
