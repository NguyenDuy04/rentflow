import { Config } from '../get-config.js';
import { registryItemSchema } from './schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

type RegistryFetchOptions = {
    requireUniversal?: boolean;
    useCache?: boolean;
    sourceCache?: Map<string, Promise<string>>;
};
declare function resolveRegistryItemsFromRegistries(items: string[], config: Config): string[];
declare function fetchRegistryItems(items: string[], config: Config, options?: RegistryFetchOptions): Promise<({
    name: string;
    type: "registry:base";
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
    config?: {
        $schema?: string | undefined;
        style?: string | undefined;
        iconLibrary?: string | undefined;
        rtl?: boolean | undefined;
        menuColor?: "default" | "inverted" | "default-translucent" | "inverted-translucent" | undefined;
        menuAccent?: "subtle" | "bold" | undefined;
        registries?: Record<string, string | {
            url: string;
            params?: Record<string, string> | undefined;
            headers?: Record<string, string> | undefined;
        }> | undefined;
        rsc?: boolean | undefined;
        tsx?: boolean | undefined;
        tailwind?: {
            config?: string | undefined;
            css?: string | undefined;
            baseColor?: string | undefined;
            prefix?: string | undefined;
            cssVariables?: boolean | undefined;
        } | undefined;
        aliases?: {
            components?: string | undefined;
            utils?: string | undefined;
            ui?: string | undefined;
            lib?: string | undefined;
            hooks?: string | undefined;
        } | undefined;
    } | undefined;
} | {
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
} | {
    name: string;
    type: "registry:file" | "registry:page" | "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:example" | "registry:internal";
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
})[]>;
declare function resolveRegistryTree(names: z.infer<typeof registryItemSchema>["name"][], config: Config, options?: RegistryFetchOptions): Promise<{
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
} | null>;

export { fetchRegistryItems, resolveRegistryItemsFromRegistries, resolveRegistryTree };
