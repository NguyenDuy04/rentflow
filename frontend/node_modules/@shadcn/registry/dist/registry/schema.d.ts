import { z } from 'zod';

declare const registryConfigItemSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    url: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>]>;
declare const registryConfigSchema: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    url: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>]>>;
declare const rawConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    style: z.ZodString;
    rsc: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tsx: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tailwind: z.ZodObject<{
        config: z.ZodOptional<z.ZodString>;
        css: z.ZodString;
        baseColor: z.ZodString;
        cssVariables: z.ZodDefault<z.ZodBoolean>;
        prefix: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    iconLibrary: z.ZodOptional<z.ZodString>;
    rtl: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    menuColor: z.ZodOptional<z.ZodEnum<{
        default: "default";
        inverted: "inverted";
        "default-translucent": "default-translucent";
        "inverted-translucent": "inverted-translucent";
    }>>;
    menuAccent: z.ZodOptional<z.ZodEnum<{
        subtle: "subtle";
        bold: "bold";
    }>>;
    aliases: z.ZodObject<{
        components: z.ZodString;
        utils: z.ZodString;
        ui: z.ZodOptional<z.ZodString>;
        lib: z.ZodOptional<z.ZodString>;
        hooks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    registries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        url: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>]>>>;
}, z.core.$strict>;
declare const configSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    style: z.ZodString;
    rsc: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tsx: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tailwind: z.ZodObject<{
        config: z.ZodOptional<z.ZodString>;
        css: z.ZodString;
        baseColor: z.ZodString;
        cssVariables: z.ZodDefault<z.ZodBoolean>;
        prefix: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    iconLibrary: z.ZodOptional<z.ZodString>;
    rtl: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    menuColor: z.ZodOptional<z.ZodEnum<{
        default: "default";
        inverted: "inverted";
        "default-translucent": "default-translucent";
        "inverted-translucent": "inverted-translucent";
    }>>;
    menuAccent: z.ZodOptional<z.ZodEnum<{
        subtle: "subtle";
        bold: "bold";
    }>>;
    aliases: z.ZodObject<{
        components: z.ZodString;
        utils: z.ZodString;
        ui: z.ZodOptional<z.ZodString>;
        lib: z.ZodOptional<z.ZodString>;
        hooks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    registries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        url: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>]>>>;
    resolvedPaths: z.ZodObject<{
        cwd: z.ZodString;
        tailwindConfig: z.ZodString;
        tailwindCss: z.ZodString;
        utils: z.ZodString;
        components: z.ZodString;
        lib: z.ZodString;
        hooks: z.ZodString;
        ui: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strict>;
type Config = z.infer<typeof configSchema>;
declare const registryBaseConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    style: z.ZodOptional<z.ZodString>;
    iconLibrary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rtl: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
    menuColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        default: "default";
        inverted: "inverted";
        "default-translucent": "default-translucent";
        "inverted-translucent": "inverted-translucent";
    }>>>;
    menuAccent: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        subtle: "subtle";
        bold: "bold";
    }>>>;
    registries: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        url: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>]>>>>;
    rsc: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    tsx: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        css: z.ZodOptional<z.ZodString>;
        baseColor: z.ZodOptional<z.ZodString>;
        prefix: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        cssVariables: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    aliases: z.ZodOptional<z.ZodObject<{
        components: z.ZodOptional<z.ZodString>;
        utils: z.ZodOptional<z.ZodString>;
        ui: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        lib: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        hooks: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
declare const workspaceConfigSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    style: z.ZodString;
    rsc: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tsx: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    tailwind: z.ZodObject<{
        config: z.ZodOptional<z.ZodString>;
        css: z.ZodString;
        baseColor: z.ZodString;
        cssVariables: z.ZodDefault<z.ZodBoolean>;
        prefix: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    iconLibrary: z.ZodOptional<z.ZodString>;
    rtl: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    menuColor: z.ZodOptional<z.ZodEnum<{
        default: "default";
        inverted: "inverted";
        "default-translucent": "default-translucent";
        "inverted-translucent": "inverted-translucent";
    }>>;
    menuAccent: z.ZodOptional<z.ZodEnum<{
        subtle: "subtle";
        bold: "bold";
    }>>;
    aliases: z.ZodObject<{
        components: z.ZodString;
        utils: z.ZodString;
        ui: z.ZodOptional<z.ZodString>;
        lib: z.ZodOptional<z.ZodString>;
        hooks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    registries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        url: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>]>>>;
    resolvedPaths: z.ZodObject<{
        cwd: z.ZodString;
        tailwindConfig: z.ZodString;
        tailwindCss: z.ZodString;
        utils: z.ZodString;
        components: z.ZodString;
        lib: z.ZodString;
        hooks: z.ZodString;
        ui: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strict>>;
declare const registryItemTypeSchema: z.ZodEnum<{
    "registry:file": "registry:file";
    "registry:page": "registry:page";
    "registry:lib": "registry:lib";
    "registry:block": "registry:block";
    "registry:component": "registry:component";
    "registry:ui": "registry:ui";
    "registry:hook": "registry:hook";
    "registry:theme": "registry:theme";
    "registry:style": "registry:style";
    "registry:item": "registry:item";
    "registry:base": "registry:base";
    "registry:font": "registry:font";
    "registry:example": "registry:example";
    "registry:internal": "registry:internal";
}>;
declare const registryItemFileSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        "registry:file": "registry:file";
        "registry:page": "registry:page";
    }>;
    target: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        "registry:lib": "registry:lib";
        "registry:block": "registry:block";
        "registry:component": "registry:component";
        "registry:ui": "registry:ui";
        "registry:hook": "registry:hook";
        "registry:theme": "registry:theme";
        "registry:style": "registry:style";
        "registry:item": "registry:item";
        "registry:base": "registry:base";
        "registry:font": "registry:font";
        "registry:example": "registry:example";
        "registry:internal": "registry:internal";
    }>;
    target: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">;
type RegistryItemFile = z.infer<typeof registryItemFileSchema>;
declare const registryItemTailwindSchema: z.ZodObject<{
    config: z.ZodOptional<z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const registryItemCssVarsSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
declare const registryItemCssSchema: z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>;
declare const registryItemEnvVarsSchema: z.ZodRecord<z.ZodString, z.ZodString>;
declare const registryItemFontSchema: z.ZodObject<{
    family: z.ZodString;
    provider: z.ZodLiteral<"google">;
    import: z.ZodString;
    variable: z.ZodString;
    weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
    subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
    selector: z.ZodOptional<z.ZodString>;
    dependency: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const registryItemCommonSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const registryItemSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodLiteral<"registry:base">;
    config: z.ZodOptional<z.ZodObject<{
        $schema: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        style: z.ZodOptional<z.ZodString>;
        iconLibrary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        rtl: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        menuColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            default: "default";
            inverted: "inverted";
            "default-translucent": "default-translucent";
            "inverted-translucent": "inverted-translucent";
        }>>>;
        menuAccent: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            subtle: "subtle";
            bold: "bold";
        }>>>;
        registries: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            url: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>]>>>>;
        rsc: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        tsx: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            css: z.ZodOptional<z.ZodString>;
            baseColor: z.ZodOptional<z.ZodString>;
            prefix: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            cssVariables: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        aliases: z.ZodOptional<z.ZodObject<{
            components: z.ZodOptional<z.ZodString>;
            utils: z.ZodOptional<z.ZodString>;
            ui: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            lib: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            hooks: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodLiteral<"registry:font">;
    font: z.ZodObject<{
        family: z.ZodString;
        provider: z.ZodLiteral<"google">;
        import: z.ZodString;
        variable: z.ZodString;
        weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
        subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
        selector: z.ZodOptional<z.ZodString>;
        dependency: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodEnum<{
        "registry:file": "registry:file";
        "registry:page": "registry:page";
        "registry:lib": "registry:lib";
        "registry:block": "registry:block";
        "registry:component": "registry:component";
        "registry:ui": "registry:ui";
        "registry:hook": "registry:hook";
        "registry:theme": "registry:theme";
        "registry:style": "registry:style";
        "registry:item": "registry:item";
        "registry:example": "registry:example";
        "registry:internal": "registry:internal";
    }>;
}, z.core.$strip>], "type">;
type RegistryItem = z.infer<typeof registryItemSchema>;
type RegistryBaseItem = Extract<RegistryItem, {
    type: "registry:base";
}>;
type RegistryFontItem = Extract<RegistryItem, {
    type: "registry:font";
}>;
declare const registryPaginationSchema: z.ZodObject<{
    total: z.ZodNumber;
    offset: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, z.core.$strip>;
declare const registryChunkSchema: z.ZodPipe<z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    include: z.ZodOptional<z.ZodArray<z.ZodString>>;
    items: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodLiteral<"registry:base">;
        config: z.ZodOptional<z.ZodObject<{
            $schema: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            style: z.ZodOptional<z.ZodString>;
            iconLibrary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            rtl: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
            menuColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
                default: "default";
                inverted: "inverted";
                "default-translucent": "default-translucent";
                "inverted-translucent": "inverted-translucent";
            }>>>;
            menuAccent: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
                subtle: "subtle";
                bold: "bold";
            }>>>;
            registries: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                url: z.ZodString;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, z.core.$strip>]>>>>;
            rsc: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
            tsx: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
            tailwind: z.ZodOptional<z.ZodObject<{
                config: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                css: z.ZodOptional<z.ZodString>;
                baseColor: z.ZodOptional<z.ZodString>;
                prefix: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                cssVariables: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            aliases: z.ZodOptional<z.ZodObject<{
                components: z.ZodOptional<z.ZodString>;
                utils: z.ZodOptional<z.ZodString>;
                ui: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                lib: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                hooks: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodLiteral<"registry:font">;
        font: z.ZodObject<{
            family: z.ZodString;
            provider: z.ZodLiteral<"google">;
            import: z.ZodString;
            variable: z.ZodString;
            weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
            selector: z.ZodOptional<z.ZodString>;
            dependency: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
    }, z.core.$strip>], "type">>>;
    pagination: z.ZodOptional<z.ZodObject<{
        total: z.ZodNumber;
        offset: z.ZodNumber;
        limit: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodTransform<{
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
    name?: string | undefined;
    homepage?: string | undefined;
    include?: string[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
}, {
    $schema?: string | undefined;
    name?: string | undefined;
    homepage?: string | undefined;
    include?: string[] | undefined;
    items?: ({
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
    })[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
}>>;
declare const registrySchema: z.ZodPipe<z.ZodPipe<z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    include: z.ZodOptional<z.ZodArray<z.ZodString>>;
    items: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodLiteral<"registry:base">;
        config: z.ZodOptional<z.ZodObject<{
            $schema: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            style: z.ZodOptional<z.ZodString>;
            iconLibrary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            rtl: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
            menuColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
                default: "default";
                inverted: "inverted";
                "default-translucent": "default-translucent";
                "inverted-translucent": "inverted-translucent";
            }>>>;
            menuAccent: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
                subtle: "subtle";
                bold: "bold";
            }>>>;
            registries: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                url: z.ZodString;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, z.core.$strip>]>>>>;
            rsc: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
            tsx: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
            tailwind: z.ZodOptional<z.ZodObject<{
                config: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                css: z.ZodOptional<z.ZodString>;
                baseColor: z.ZodOptional<z.ZodString>;
                prefix: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                cssVariables: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            aliases: z.ZodOptional<z.ZodObject<{
                components: z.ZodOptional<z.ZodString>;
                utils: z.ZodOptional<z.ZodString>;
                ui: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                lib: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                hooks: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodLiteral<"registry:font">;
        font: z.ZodObject<{
            family: z.ZodString;
            provider: z.ZodLiteral<"google">;
            import: z.ZodString;
            variable: z.ZodString;
            weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
            selector: z.ZodOptional<z.ZodString>;
            dependency: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
    }, z.core.$strip>], "type">>>;
    pagination: z.ZodOptional<z.ZodObject<{
        total: z.ZodNumber;
        offset: z.ZodNumber;
        limit: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodTransform<{
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
    name?: string | undefined;
    homepage?: string | undefined;
    include?: string[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
}, {
    $schema?: string | undefined;
    name?: string | undefined;
    homepage?: string | undefined;
    include?: string[] | undefined;
    items?: ({
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
    })[] | undefined;
    pagination?: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    } | undefined;
}>>, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    homepage: z.ZodString;
    include: z.ZodOptional<z.ZodArray<z.ZodString>>;
    items: z.ZodArray<z.ZodCustom<{
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
    }, {
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
    }>>;
    pagination: z.ZodOptional<z.ZodObject<{
        total: z.ZodNumber;
        offset: z.ZodNumber;
        limit: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>>;
type Registry = z.infer<typeof registrySchema>;
declare const registryIndexSchema: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodLiteral<"registry:base">;
    config: z.ZodOptional<z.ZodObject<{
        $schema: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        style: z.ZodOptional<z.ZodString>;
        iconLibrary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        rtl: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        menuColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            default: "default";
            inverted: "inverted";
            "default-translucent": "default-translucent";
            "inverted-translucent": "inverted-translucent";
        }>>>;
        menuAccent: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            subtle: "subtle";
            bold: "bold";
        }>>>;
        registries: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            url: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>]>>>>;
        rsc: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        tsx: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            css: z.ZodOptional<z.ZodString>;
            baseColor: z.ZodOptional<z.ZodString>;
            prefix: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            cssVariables: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        aliases: z.ZodOptional<z.ZodObject<{
            components: z.ZodOptional<z.ZodString>;
            utils: z.ZodOptional<z.ZodString>;
            ui: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            lib: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            hooks: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodLiteral<"registry:font">;
    font: z.ZodObject<{
        family: z.ZodString;
        provider: z.ZodLiteral<"google">;
        import: z.ZodString;
        variable: z.ZodString;
        weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
        subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
        selector: z.ZodOptional<z.ZodString>;
        dependency: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    type: z.ZodEnum<{
        "registry:file": "registry:file";
        "registry:page": "registry:page";
        "registry:lib": "registry:lib";
        "registry:block": "registry:block";
        "registry:component": "registry:component";
        "registry:ui": "registry:ui";
        "registry:hook": "registry:hook";
        "registry:theme": "registry:theme";
        "registry:style": "registry:style";
        "registry:item": "registry:item";
        "registry:example": "registry:example";
        "registry:internal": "registry:internal";
    }>;
}, z.core.$strip>], "type">>;
declare const stylesSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
}, z.core.$strip>>;
declare const iconsSchema: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>;
declare const registryBaseColorSchema: z.ZodObject<{
    inlineColors: z.ZodObject<{
        light: z.ZodRecord<z.ZodString, z.ZodString>;
        dark: z.ZodRecord<z.ZodString, z.ZodString>;
    }, z.core.$strip>;
    cssVars: z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>;
    cssVarsV4: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    inlineColorsTemplate: z.ZodString;
    cssVarsTemplate: z.ZodString;
}, z.core.$strip>;
declare const registryResolvedItemsTreeSchema: z.ZodObject<{
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString>>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:file": "registry:file";
            "registry:page": "registry:page";
        }>;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            "registry:lib": "registry:lib";
            "registry:block": "registry:block";
            "registry:component": "registry:component";
            "registry:ui": "registry:ui";
            "registry:hook": "registry:hook";
            "registry:theme": "registry:theme";
            "registry:style": "registry:style";
            "registry:item": "registry:item";
            "registry:base": "registry:base";
            "registry:font": "registry:font";
            "registry:example": "registry:example";
            "registry:internal": "registry:internal";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    docs: z.ZodOptional<z.ZodString>;
    fonts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        $schema: z.ZodOptional<z.ZodString>;
        extends: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        devDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        files: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:file": "registry:file";
                "registry:page": "registry:page";
            }>;
            target: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            path: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                "registry:lib": "registry:lib";
                "registry:block": "registry:block";
                "registry:component": "registry:component";
                "registry:ui": "registry:ui";
                "registry:hook": "registry:hook";
                "registry:theme": "registry:theme";
                "registry:style": "registry:style";
                "registry:item": "registry:item";
                "registry:base": "registry:base";
                "registry:font": "registry:font";
                "registry:example": "registry:example";
                "registry:internal": "registry:internal";
            }>;
            target: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>;
        tailwind: z.ZodOptional<z.ZodObject<{
            config: z.ZodOptional<z.ZodObject<{
                content: z.ZodOptional<z.ZodArray<z.ZodString>>;
                theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                plugins: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        cssVars: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        css: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>>>;
        envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        docs: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodLiteral<"registry:font">;
        font: z.ZodObject<{
            family: z.ZodString;
            provider: z.ZodLiteral<"google">;
            import: z.ZodString;
            variable: z.ZodString;
            weight: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subsets: z.ZodOptional<z.ZodArray<z.ZodString>>;
            selector: z.ZodOptional<z.ZodString>;
            dependency: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
declare const searchResultItemSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    registry: z.ZodString;
    addCommandArgument: z.ZodString;
}, z.core.$strip>;
declare const searchResultErrorSchema: z.ZodObject<{
    registry: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
declare const searchResultsSchema: z.ZodObject<{
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        offset: z.ZodNumber;
        limit: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        registry: z.ZodString;
        addCommandArgument: z.ZodString;
    }, z.core.$strip>>;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        registry: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
declare const registriesIndexSchema: z.ZodRecord<z.ZodString, z.ZodString>;
declare const registriesSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    homepage: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
declare const presetSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    base: z.ZodString;
    style: z.ZodString;
    baseColor: z.ZodString;
    theme: z.ZodString;
    iconLibrary: z.ZodString;
    font: z.ZodString;
    rtl: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    menuAccent: z.ZodEnum<{
        subtle: "subtle";
        bold: "bold";
    }>;
    menuColor: z.ZodEnum<{
        default: "default";
        inverted: "inverted";
        "default-translucent": "default-translucent";
        "inverted-translucent": "inverted-translucent";
    }>;
    radius: z.ZodString;
}, z.core.$strip>;
type Preset = z.infer<typeof presetSchema>;
declare const configJsonSchema: z.ZodObject<{
    presets: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        base: z.ZodString;
        style: z.ZodString;
        baseColor: z.ZodString;
        theme: z.ZodString;
        iconLibrary: z.ZodString;
        font: z.ZodString;
        rtl: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
        menuAccent: z.ZodEnum<{
            subtle: "subtle";
            bold: "bold";
        }>;
        menuColor: z.ZodEnum<{
            default: "default";
            inverted: "inverted";
            "default-translucent": "default-translucent";
            "inverted-translucent": "inverted-translucent";
        }>;
        radius: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ConfigJson = z.infer<typeof configJsonSchema>;

export { type Config, type ConfigJson, type Preset, type Registry, type RegistryBaseItem, type RegistryFontItem, type RegistryItem, type RegistryItemFile, configJsonSchema, configSchema, iconsSchema, presetSchema, rawConfigSchema, registriesIndexSchema, registriesSchema, registryBaseColorSchema, registryBaseConfigSchema, registryChunkSchema, registryConfigItemSchema, registryConfigSchema, registryIndexSchema, registryItemCommonSchema, registryItemCssSchema, registryItemCssVarsSchema, registryItemEnvVarsSchema, registryItemFileSchema, registryItemFontSchema, registryItemSchema, registryItemTailwindSchema, registryItemTypeSchema, registryPaginationSchema, registryResolvedItemsTreeSchema, registrySchema, searchResultErrorSchema, searchResultItemSchema, searchResultsSchema, stylesSchema, workspaceConfigSchema };
