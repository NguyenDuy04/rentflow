import { Config } from '../get-config.js';
import { registryBaseColorSchema } from '../registry/schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

type TransformOpts = {
    filename: string;
    raw: string;
    config: Config;
    baseColor?: z.infer<typeof registryBaseColorSchema>;
    transformJsx?: boolean;
    isRemote?: boolean;
    supportedFontMarkers?: string[];
};
type Transformer = (code: string, opts: TransformOpts) => string | Promise<string>;
declare function transform(opts: TransformOpts, transformers?: Transformer[]): Promise<string>;

export { type TransformOpts, type Transformer, transform };
