import { Config } from '../get-config.js';
import { RegistryItem } from '../registry/schema.js';
import '../json-config.js';
import '../preset/preset.js';
import 'zod';

declare function updateDependencies(dependencies: RegistryItem["dependencies"], devDependencies: RegistryItem["devDependencies"], config: Config, options: {
    silent?: boolean;
    interactive?: boolean;
}): Promise<void>;
declare function installDependencies(cwd: string, dependencies: string[], devDependencies?: string[]): Promise<void>;
declare function removeDependencies(cwd: string, dependencies: string[]): Promise<void>;
/**
 * Registry-supplied dependency strings are forwarded directly into the package
 * manager's argument list. A specifier beginning with "-" would be interpreted
 * as a flag rather than a package name, letting a malicious registry alter the
 * install source/behavior (argument injection). Reject those before they reach
 * `execa`; the `--` end-of-options separator added at each call site is the
 * second layer of defense.
 */
declare function assertSafeDependencies(deps: string[]): void;

export { assertSafeDependencies, installDependencies, removeDependencies, updateDependencies };
