import { Transformer } from './index.js';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import '../registry/schema.js';
import 'zod';

declare function stripCnMarkers(className: string): string;
declare const transformCleanup: Transformer;
declare function cleanupMarkers(source: string): Promise<string>;

export { cleanupMarkers, stripCnMarkers, transformCleanup };
