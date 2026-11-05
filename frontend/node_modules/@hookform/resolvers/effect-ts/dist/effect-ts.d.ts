import { Schema } from 'effect';
import type { ParseOptions } from 'effect/SchemaAST';
import { FieldValues, Resolver } from 'react-hook-form';
export declare function effectTsResolver<Input extends FieldValues, Context, Output>(schema: Schema.Codec<Output, Input, never, unknown>, schemaOptions?: ParseOptions, resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
}): Resolver<Input, Context, Output>;
export declare function effectTsResolver<Input extends FieldValues, Context, Output>(schema: Schema.Codec<Output, Input, never, unknown>, schemaOptions: ParseOptions | undefined, resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
}): Resolver<Input, Context, Input>;
