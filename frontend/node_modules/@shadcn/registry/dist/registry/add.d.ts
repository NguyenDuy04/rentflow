import { Config } from '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import './schema.js';
import 'zod';

declare function addRegistryItems(items: string[], options?: {
    cwd?: string;
    config?: Partial<Config>;
    overwrite?: boolean;
    overwriteCssVars?: boolean;
    silent?: boolean;
    skipFonts?: boolean;
    path?: string;
}): Promise<void>;

export { addRegistryItems };
