import { Resolver } from 'react-hook-form';
import type { Static, StaticDecode, TObject, TProperties } from 'typebox';
import { Validator } from 'typebox/compile';
/**
 * Creates a resolver for react-hook-form using Typebox schema validation
 * @param {Schema | Validator<TypeContext, Schema>} schema - The Typebox schema to validate against
 * @param {Object} options - Additional resolver configuration
 * @param {string} [options.mode='async'] - Validation mode
 * @returns {Resolver<Static<Schema, TypeContext>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Type.Object({
 *   name: Type.String(),
 *   age: Type.Number()
 * });
 *
 * useForm({
 *   resolver: typeboxResolver(schema)
 * });
 *
 * // Custom string formats must be registered with TypeBox's own `Format` registry
 * // before validating, since this resolver validates via `typebox`'s `Value.Errors`:
 * // Format.Set('slug', (value) => /^[a-z0-9-]+$/.test(value));
 */
export declare function typeboxResolver<Schema extends TObject, Context, TypeContext extends TProperties = Record<never, never>>(schema: Schema | Validator<TypeContext, Schema>): Resolver<Static<Schema, TypeContext>, Context, StaticDecode<Schema, TypeContext>>;
