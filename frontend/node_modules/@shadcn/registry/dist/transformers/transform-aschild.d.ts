import { Transformer } from './index.js';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import '../registry/schema.js';
import 'zod';

declare const transformAsChild: Transformer;

export { transformAsChild };
