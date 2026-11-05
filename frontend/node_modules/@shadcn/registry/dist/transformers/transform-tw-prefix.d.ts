import { Transformer } from './index.js';
import { types } from '@babel/core';
import { TailwindVersion } from '../get-project-info.js';
import '../get-config.js';
import '../json-config.js';
import '../preset/preset.js';
import '../registry/schema.js';
import 'zod';
import '../frameworks.js';
import '../get-package-info.js';
import 'type-fest';

declare const transformTwPrefixes: Transformer;
declare function getClassNameStrings(code: string, file: types.File): types.StringLiteral[];
declare function getArgumentStrings(arg: types.CallExpression["arguments"][number], { binary }: {
    binary: boolean;
}): types.StringLiteral[];
declare function getPropertyAssignments(node: types.Node): (types.ObjectProperty & {
    shorthand: false;
})[];
declare function applyPrefix(input: string, prefix: string | undefined, tailwindVersion: TailwindVersion): string;
declare function applyPrefixesCss(css: string, prefix: string, tailwindVersion: TailwindVersion): string;

export { applyPrefix, applyPrefixesCss, getArgumentStrings, getClassNameStrings, getPropertyAssignments, transformTwPrefixes };
