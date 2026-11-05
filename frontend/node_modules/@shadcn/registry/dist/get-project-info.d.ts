import { Framework } from './frameworks.js';
import { Config } from './get-config.js';
import { getPackageInfo } from './get-package-info.js';
import './json-config.js';
import './preset/preset.js';
import './registry/schema.js';
import 'zod';
import 'type-fest';

type TailwindVersion = "v3" | "v4" | null;
type ProjectInfo = {
    framework: Framework;
    isSrcDir: boolean;
    isRSC: boolean;
    isTsx: boolean;
    tailwindConfigFile: string | null;
    tailwindCssFile: string | null;
    tailwindVersion: TailwindVersion;
    frameworkVersion: string | null;
    aliasPrefix: string | null;
};
declare function getProjectInfo(cwd: string, opts?: {
    configCssFile?: string;
}): Promise<ProjectInfo | null>;
declare function getFrameworkVersion(framework: Framework, packageJson: ReturnType<typeof getPackageInfo>): Promise<string | null>;
declare function getTailwindVersion(cwd: string): Promise<ProjectInfo["tailwindVersion"]>;
declare function getTailwindCssFile(cwd: string, configCssFile?: string): Promise<string | null>;
declare function getTailwindConfigFile(cwd: string): Promise<string | null>;
declare function getTsConfigAliasPrefix(cwd: string): Promise<string | null>;
declare function getProjectAliasInfo(cwd: string): Promise<{
    prefix: string;
    source: "package_imports";
} | {
    prefix: string;
    source: "tsconfig_paths";
} | {
    prefix: null;
    source: null;
}>;
declare function isTypeScriptProject(cwd: string): Promise<boolean>;
declare function getTsConfig(cwd: string): Promise<{
    compilerOptions: {
        paths: Record<string, string | string[]>;
    };
} | null>;
declare function getProjectConfig(cwd: string, defaultProjectInfo?: ProjectInfo | null): Promise<Config | null>;
declare function getProjectTailwindVersionFromConfig(config: {
    resolvedPaths: Pick<Config["resolvedPaths"], "cwd">;
}): Promise<TailwindVersion>;
declare function getProjectComponents(cwd: string): Promise<string[]>;

export { type ProjectInfo, type TailwindVersion, getFrameworkVersion, getProjectAliasInfo, getProjectComponents, getProjectConfig, getProjectInfo, getProjectTailwindVersionFromConfig, getTailwindConfigFile, getTailwindCssFile, getTailwindVersion, getTsConfig, getTsConfigAliasPrefix, isTypeScriptProject };
