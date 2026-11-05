import type { ESLint } from 'eslint';
/**
 * ESLint 10 removed the deprecated `context.getCwd()`, `context.getFilename()`,
 * `context.getPhysicalFilename()`, `context.getSourceCode()`,
 * `context.parserOptions` and `context.parserPath` rule context members.
 * eslint-plugin-react (e.g. `settings.react.version: 'detect'`) and
 * eslint-plugin-import (e.g. `import/no-default-export`) still read them, and
 * have no release that supports ESLint 10 yet.
 *
 * The rules are patched in place instead of returning a wrapped plugin, so the
 * plugin keeps its identity. Users commonly combine this config with the
 * plugin's own configs (e.g. `react.configs.flat.recommended`), and ESLint
 * rejects two different objects registered under the same plugin name.
 *
 * On ESLint 9 the original context is passed through unchanged.
 */
export declare function fixupPluginRules<T extends ESLint.Plugin>(plugin: T): T;
