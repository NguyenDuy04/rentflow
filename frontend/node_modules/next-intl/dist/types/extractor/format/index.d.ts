import type ExtractorCodec from './ExtractorCodec.js';
import type { MessagesFormat } from './types.js';
declare const formats: {
    json: {
        codec: () => Promise<typeof import("@eloqnt/format-json")>;
        extension: ".json";
    };
    po: {
        codec: () => Promise<typeof import("./codecs/BuiltInPoCodec.js")>;
        extension: ".po";
    };
};
export default formats;
export declare function getFormatExtension(format: MessagesFormat): string;
export declare function resolveCodec(format: MessagesFormat, projectRoot: string): Promise<ExtractorCodec>;
