import { Config } from '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import './schema.js';
import 'zod';

declare function resolveRegistryNamespaces(components: string[], config: Config): Promise<string[]>;

export { resolveRegistryNamespaces };
