import { TransformOpts } from '@shadcn/registry/internal/transformers/index';
import { SourceFile } from 'ts-morph';
import { z } from 'zod';
export { transformDirection } from '@shadcn/registry/internal/transformers/transform-rtl';

type SourceFileTransformer = (opts: TransformOpts & {
    sourceFile: SourceFile;
}) => Promise<SourceFile>;

declare const styleMapSchema: z.ZodRecord<z.ZodString, z.ZodString>;
type StyleMap = z.infer<typeof styleMapSchema>;
declare function createStyleMap(input: string): Record<string, string>;

type TransformerStyle<Output = SourceFile> = (opts: {
    sourceFile: SourceFile;
    styleMap: StyleMap;
}) => Promise<Output>;
declare function transformStyle(source: string, { styleMap, transformers, }: {
    styleMap: StyleMap;
    transformers?: TransformerStyle<SourceFile>[];
}): Promise<string>;

declare const transformRenderSourceFile: SourceFileTransformer;

declare const transformFont: SourceFileTransformer;
declare const transformIcons: SourceFileTransformer;
declare const transformMenu: SourceFileTransformer;

export { createStyleMap, transformFont, transformIcons, transformMenu, transformRenderSourceFile as transformRender, transformStyle };
