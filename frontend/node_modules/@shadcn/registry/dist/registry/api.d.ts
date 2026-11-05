import { Config } from '../get-config.js';
import { registryItemSchema, registryConfigSchema, registryIndexSchema } from './schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

type RegistryApiOptions = {
    config?: Partial<Config>;
    useCache?: boolean;
};
type RegistrySearchParams = {
    query?: string;
    types?: string[];
    limit?: number;
    offset?: number;
};
type GetRegistryOptions = RegistryApiOptions & {
    searchParams?: RegistrySearchParams;
};
declare function getRegistry(name: string, options?: GetRegistryOptions): Promise<{
    name: string;
    homepage: string;
    items: ({
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
    })[];
    $schema?: string | undefined;
    include?: string[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
} | {
    items: ({
        files: ({
            path: string;
            type: "registry:file" | "registry:page";
            target: string;
        } | {
            path: string;
            type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
            target?: string | undefined;
        })[] | undefined;
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
        files: ({
            path: string;
            type: "registry:file" | "registry:page";
            target: string;
        } | {
            path: string;
            type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
            target?: string | undefined;
        })[] | undefined;
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
        files: ({
            path: string;
            type: "registry:file" | "registry:page";
            target: string;
        } | {
            path: string;
            type: "registry:lib" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:style" | "registry:item" | "registry:base" | "registry:font" | "registry:example" | "registry:internal";
            target?: string | undefined;
        })[] | undefined;
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
    })[];
    name: string;
    homepage: string;
    $schema?: string | undefined;
    include?: string[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
}>;
declare function getRegistryItems(items: string[], options?: RegistryApiOptions): Promise<({
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
declare function resolveRegistryItems(items: string[], options?: RegistryApiOptions): Promise<{
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
declare function getRegistriesConfig(cwd: string, options?: {
    useCache?: boolean;
}): Promise<{
    registries: {
        [x: string]: string | {
            url: string;
            params?: Record<string, string> | undefined;
            headers?: Record<string, string> | undefined;
        };
    };
}>;
declare function getPackageJsonRegistries(cwd: string): Promise<z.infer<typeof registryConfigSchema>>;
declare function getShadcnRegistryIndex(): Promise<({
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
declare function getRegistryBaseColors(): Promise<readonly [{
    readonly name: "neutral";
    readonly label: "Neutral";
}, {
    readonly name: "zinc";
    readonly label: "Zinc";
}, {
    readonly name: "stone";
    readonly label: "Stone";
}, {
    readonly name: "mauve";
    readonly label: "Mauve";
}, {
    readonly name: "olive";
    readonly label: "Olive";
}, {
    readonly name: "mist";
    readonly label: "Mist";
}, {
    readonly name: "taupe";
    readonly label: "Taupe";
}]>;
declare function getRegistryBaseColor(baseColor: string): Promise<{
    inlineColors: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
    cssVars: {
        theme?: Record<string, string> | undefined;
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    };
    inlineColorsTemplate: string;
    cssVarsTemplate: string;
    cssVarsV4?: {
        theme?: Record<string, string> | undefined;
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
}>;
/**
 * @deprecated This function is deprecated and will be removed in a future version.
 */
declare function resolveTree(index: z.infer<typeof registryIndexSchema>, names: string[]): Promise<({
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
/**
 * @deprecated This function is deprecated and will be removed in a future version.
 */
declare function getItemTargetPath(config: Config, item: Pick<z.infer<typeof registryItemSchema>, "type">, override?: string): Promise<string | null>;
declare function getRegistries(options?: {
    useCache?: boolean;
}): Promise<{
    name: string;
    url: string;
    homepage?: string | undefined;
    description?: string | undefined;
}[]>;
/**
 * @deprecated Use getRegistries() instead.
 */
declare function getRegistriesIndex(options?: {
    useCache?: boolean;
}): Promise<Record<string, string> | null>;
declare function getPresets(options?: {
    useCache?: boolean;
}): Promise<{
    name: string;
    title: string;
    description: string;
    base: string;
    style: string;
    baseColor: string;
    theme: string;
    iconLibrary: string;
    font: string;
    rtl: boolean;
    menuAccent: "subtle" | "bold";
    menuColor: "default" | "inverted" | "default-translucent" | "inverted-translucent";
    radius: string;
}[]>;
declare function getPreset(name: string, options?: {
    useCache?: boolean;
}): Promise<{
    name: string;
    title: string;
    description: string;
    base: string;
    style: string;
    baseColor: string;
    theme: string;
    iconLibrary: string;
    font: string;
    rtl: boolean;
    menuAccent: "subtle" | "bold";
    menuColor: "default" | "inverted" | "default-translucent" | "inverted-translucent";
    radius: string;
} | null>;

export { getItemTargetPath, getPackageJsonRegistries, getPreset, getPresets, getRegistries, getRegistriesConfig, getRegistriesIndex, getRegistry, getRegistryBaseColor, getRegistryBaseColors, getRegistryItems, getShadcnRegistryIndex, resolveRegistryItems, resolveTree };
