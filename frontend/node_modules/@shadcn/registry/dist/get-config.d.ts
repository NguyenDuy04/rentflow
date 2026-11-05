import { JsonConfigResult } from './json-config.js';
import { PresetBase } from './preset/preset.js';
import { configSchema, rawConfigSchema } from './registry/schema.js';
import { z } from 'zod';

declare const DEFAULT_STYLE = "default";
declare const DEFAULT_COMPONENTS = "@/components";
declare const DEFAULT_UTILS = "@/lib/utils";
declare const DEFAULT_TAILWIND_CSS = "app/globals.css";
declare const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";
declare const DEFAULT_TAILWIND_BASE_COLOR = "slate";
declare const explorer: {
    search(dir: string): Promise<JsonConfigResult>;
    load(filepath: string): Promise<JsonConfigResult>;
    clearCaches(): void;
};
type Config = z.infer<typeof configSchema>;
declare function getConfig(cwd: string): Promise<{
    style: string;
    rsc: boolean;
    tsx: boolean;
    tailwind: {
        css: string;
        baseColor: string;
        cssVariables: boolean;
        config?: string | undefined;
        prefix?: string | undefined;
    };
    aliases: {
        components: string;
        utils: string;
        ui?: string | undefined;
        lib?: string | undefined;
        hooks?: string | undefined;
    };
    resolvedPaths: {
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
        utils: string;
        components: string;
        lib: string;
        hooks: string;
        ui: string;
    };
    $schema?: string | undefined;
    iconLibrary?: string | undefined;
    rtl?: boolean | undefined;
    menuColor?: "default" | "inverted" | "default-translucent" | "inverted-translucent" | undefined;
    menuAccent?: "subtle" | "bold" | undefined;
    registries?: Record<string, string | {
        url: string;
        params?: Record<string, string> | undefined;
        headers?: Record<string, string> | undefined;
    }> | undefined;
} | null>;
declare function resolveConfigPaths(cwd: string, config: z.infer<typeof rawConfigSchema>): Promise<{
    style: string;
    rsc: boolean;
    tsx: boolean;
    tailwind: {
        css: string;
        baseColor: string;
        cssVariables: boolean;
        config?: string | undefined;
        prefix?: string | undefined;
    };
    aliases: {
        components: string;
        utils: string;
        ui?: string | undefined;
        lib?: string | undefined;
        hooks?: string | undefined;
    };
    resolvedPaths: {
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
        utils: string;
        components: string;
        lib: string;
        hooks: string;
        ui: string;
    };
    $schema?: string | undefined;
    iconLibrary?: string | undefined;
    rtl?: boolean | undefined;
    menuColor?: "default" | "inverted" | "default-translucent" | "inverted-translucent" | undefined;
    menuAccent?: "subtle" | "bold" | undefined;
    registries?: Record<string, string | {
        url: string;
        params?: Record<string, string> | undefined;
        headers?: Record<string, string> | undefined;
    }> | undefined;
}>;
declare function getRawConfig(cwd: string): Promise<z.infer<typeof rawConfigSchema> | null>;
declare function getWorkspaceConfig(config: Config): Promise<Record<string, {
    style: string;
    rsc: boolean;
    tsx: boolean;
    tailwind: {
        css: string;
        baseColor: string;
        cssVariables: boolean;
        config?: string | undefined;
        prefix?: string | undefined;
    };
    aliases: {
        components: string;
        utils: string;
        ui?: string | undefined;
        lib?: string | undefined;
        hooks?: string | undefined;
    };
    resolvedPaths: {
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
        utils: string;
        components: string;
        lib: string;
        hooks: string;
        ui: string;
    };
    $schema?: string | undefined;
    iconLibrary?: string | undefined;
    rtl?: boolean | undefined;
    menuColor?: "default" | "inverted" | "default-translucent" | "inverted-translucent" | undefined;
    menuAccent?: "subtle" | "bold" | undefined;
    registries?: Record<string, string | {
        url: string;
        params?: Record<string, string> | undefined;
        headers?: Record<string, string> | undefined;
    }> | undefined;
}> | null>;
declare function findPackageRoot(cwd: string, resolvedPath: string): Promise<string | null>;
declare function findCommonRoot(cwd: string, resolvedPath: string): string;
declare function getTargetStyleFromConfig(cwd: string, fallback: string): Promise<string>;
declare function getBase(style: string | undefined): PresetBase;
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
declare function createConfig(partial?: DeepPartial<Config>): Config;

export { type Config, DEFAULT_COMPONENTS, DEFAULT_STYLE, DEFAULT_TAILWIND_BASE_COLOR, DEFAULT_TAILWIND_CONFIG, DEFAULT_TAILWIND_CSS, DEFAULT_UTILS, type DeepPartial, createConfig, explorer, findCommonRoot, findPackageRoot, getBase, getConfig, getRawConfig, getTargetStyleFromConfig, getWorkspaceConfig, resolveConfigPaths };
