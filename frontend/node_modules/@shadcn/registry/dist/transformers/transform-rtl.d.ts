import { Transformer } from './index.js';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import '../registry/schema.js';
import 'zod';

declare const transformRtl: Transformer;
declare function transformDirection(source: string, rtl: boolean): Promise<string>;
declare function applyRtlMapping(input: string): string;

export { applyRtlMapping, transformDirection, transformRtl };
