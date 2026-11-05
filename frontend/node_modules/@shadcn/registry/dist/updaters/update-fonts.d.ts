import { Config } from '../get-config.js';
import { ProjectInfo } from '../get-project-info.js';
import { registryResolvedItemsTreeSchema, RegistryFontItem } from '../registry/schema.js';
import z from 'zod';
import '../json-config.js';
import '../preset/preset.js';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

declare function massageTreeForFonts(tree: z.infer<typeof registryResolvedItemsTreeSchema>, config: Config): Promise<{
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    css?: Record<string, any> | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    files?: ({
        path: string;
        type: "registry:file" | "registry:page";
        target: string;
        content?: string | undefined;
    } | {
        path: string;
        type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
        content?: string | undefined;
        target?: string | undefined;
    })[] | undefined;
    cssVars?: {
        theme?: Record<string, string> | undefined;
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    envVars?: Record<string, string> | undefined;
    docs?: string | undefined;
    fonts?: {
        name: string;
        type: "registry:font";
        font: {
            family: string;
            provider: "google";
            import: string;
            variable: string;
            weight?: string[] | undefined;
            subsets?: string[] | undefined;
            selector?: string | undefined;
            dependency?: string | undefined;
        };
        $schema?: string | undefined;
        extends?: string | undefined;
        title?: string | undefined;
        author?: string | undefined;
        description?: string | undefined;
        dependencies?: string[] | undefined;
        devDependencies?: string[] | undefined;
        registryDependencies?: string[] | undefined;
        files?: ({
            path: string;
            type: "registry:file" | "registry:page";
            target: string;
            content?: string | undefined;
        } | {
            path: string;
            type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
            content?: string | undefined;
            target?: string | undefined;
        })[] | undefined;
        tailwind?: {
            config?: {
                content?: string[] | undefined;
                theme?: Record<string, any> | undefined;
                plugins?: string[] | undefined;
            } | undefined;
        } | undefined;
        cssVars?: {
            theme?: Record<string, string> | undefined;
            light?: Record<string, string> | undefined;
            dark?: Record<string, string> | undefined;
        } | undefined;
        css?: Record<string, any> | undefined;
        envVars?: Record<string, string> | undefined;
        meta?: Record<string, any> | undefined;
        docs?: string | undefined;
        categories?: string[] | undefined;
    }[] | undefined;
}>;
declare function updateFonts(fonts: RegistryFontItem[] | undefined, config: Config, options: {
    silent?: boolean;
}): Promise<string | undefined>;
declare function findLayoutFile(config: Config, projectInfo: ProjectInfo): Promise<string | null>;
declare function transformLayoutFonts(input: string, fonts: RegistryFontItem[], config: Config): Promise<string>;

export { findLayoutFile, massageTreeForFonts, transformLayoutFonts, updateFonts };
