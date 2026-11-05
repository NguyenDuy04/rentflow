import { PresetBase } from '../preset/preset.js';
import { registryConfigSchema } from './schema.js';
import { z } from 'zod';

declare const REGISTRY_URL: string;
declare const SHADCN_URL: string;
declare const FALLBACK_STYLE = "new-york-v4";
declare const BASE_COLORS: readonly [{
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
}];
declare const BUILTIN_REGISTRIES: z.infer<typeof registryConfigSchema>;
declare const BUILTIN_MODULES: Set<string[]>;
type DeprecatedComponent = {
    name: string;
    deprecatedBy: string;
    message: string;
    availableIn?: PresetBase[];
};
declare const DEPRECATED_COMPONENTS: DeprecatedComponent[];
declare const COMPONENTS_HIDDEN_FROM_SELECTION: {
    name: string;
    hiddenIn: PresetBase[];
}[];

export { BASE_COLORS, BUILTIN_MODULES, BUILTIN_REGISTRIES, COMPONENTS_HIDDEN_FROM_SELECTION, DEPRECATED_COMPONENTS, FALLBACK_STYLE, REGISTRY_URL, SHADCN_URL };
