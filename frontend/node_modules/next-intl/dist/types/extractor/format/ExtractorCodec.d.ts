import type { defineCodec as sharedDefineCodec } from '@eloqnt/config';
import type { Locale } from '../types.js';
type SeparateFileCodec = Extract<ReturnType<ReturnType<typeof sharedDefineCodec>>, {
    decode: unknown;
}>;
export default interface ExtractorCodec extends SeparateFileCodec {
    /**
     * @deprecated No longer used. Catalogs are loaded into your application via
     * `decode`, so you can remove `toJSONString` from your codec. Providing it
     * logs a deprecation warning and has no effect.
     */
    toJSONString?(content: string, context: {
        locale: Locale;
    }): string;
}
export declare function defineCodec(factory: () => ExtractorCodec): () => ExtractorCodec;
export {};
