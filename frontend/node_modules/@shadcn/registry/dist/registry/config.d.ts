import { DeepPartial, Config } from '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import './schema.js';
import 'zod';

declare function configWithDefaults(config?: DeepPartial<Config>): {
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
};

export { configWithDefaults };
