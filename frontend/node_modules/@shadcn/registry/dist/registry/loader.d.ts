import { Registry, RegistryItem } from './schema.js';
import 'zod';

type RegistryItemSource = {
    registryFile: string;
    registryDir: string;
    itemIndex: number;
};
type RegistryLoadResult = {
    registry: Registry;
    itemSources: Map<string, RegistryItemSource>;
    itemSourcesByItem: Map<RegistryItem, RegistryItemSource>;
    usesInclude: boolean;
};
type LoadRegistryOptions = {
    cwd?: string;
    registryFile?: string;
};
declare function loadRegistry(options?: LoadRegistryOptions): Promise<{
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
declare function loadRegistryItem(itemName: string, options?: LoadRegistryOptions): Promise<{
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
}>;
declare function readRegistryWithIncludes(registryFile: string, options: {
    cwd: string;
}): Promise<{
    registry: {
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
    };
    itemSources: Map<string, RegistryItemSource>;
    itemSourcesByItem: Map<{
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
    }, RegistryItemSource>;
    usesInclude: false;
} | {
    registry: {
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
    };
    itemSources: Map<string, RegistryItemSource>;
    itemSourcesByItem: Map<{
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
    }, RegistryItemSource>;
    usesInclude: true;
}>;
declare function createRegistryCatalog(result: RegistryLoadResult, rootDir: string, fallbackDir: string): {
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
};
declare function createRegistryItem(item: RegistryItem, result: RegistryLoadResult, rootDir: string, fallbackDir: string): Promise<{
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
}>;
declare function getRegistryItemFileSource(itemName: string, filePath: string, itemSources: Map<string, RegistryItemSource>, fallbackDir: string): string;
declare function getRegistryItemFileRootPath(itemName: string, filePath: string, itemSources: Map<string, RegistryItemSource>, rootDir: string, fallbackDir: string): string;

export { type LoadRegistryOptions, createRegistryCatalog, createRegistryItem, getRegistryItemFileRootPath, getRegistryItemFileSource, loadRegistry, loadRegistryItem, readRegistryWithIncludes };
