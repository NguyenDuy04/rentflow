import { Config } from './get-config.js';
import { ProjectInfo } from './get-project-info.js';
import { registryItemFileSchema } from './registry/schema.js';
import { z } from 'zod';
import './json-config.js';
import './preset/preset.js';
import './frameworks.js';
import './get-package-info.js';
import 'type-fest';

declare function resolveFilePath(file: z.infer<typeof registryItemFileSchema>, config: Config, options: {
    isSrcDir?: boolean;
    commonRoot?: string;
    framework?: ProjectInfo["framework"]["name"];
    path?: string;
    fileIndex?: number;
}): string;
declare function findCommonRoot(paths: string[], needle: string): string;
declare function resolveNestedFilePath(filePath: string, targetDir: string): string;
declare function resolvePageTarget(target: string, framework?: ProjectInfo["framework"]["name"]): string;

export { findCommonRoot, resolveFilePath, resolveNestedFilePath, resolvePageTarget };
