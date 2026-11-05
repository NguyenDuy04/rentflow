import { types } from '@babel/core';
import { ParseResult } from '@babel/parser';

interface ParseOptions {
    jsx?: boolean;
}
type ParseModuleOptions = ParseOptions & {
    tokens?: boolean;
};
declare function parseModule(code: string, options?: ParseModuleOptions): ParseResult<types.File>;
declare function parseTransformInput(code: string): ParseResult<types.File> | undefined;
declare function parseMaskingLines(code: string): {
    code: string;
    file: ParseResult<types.File>;
} | undefined;
declare function getChildNodes(node: types.Node): types.Node[];
declare function countSyntaxErrors(code: string, options?: ParseOptions): number;
declare function countSyntaxErrorsExceptSkippedCommas(code: string, options?: ParseOptions): number;
declare function addsSyntaxErrors(input: string, output: string, options?: ParseOptions): boolean;
declare function getDescendants<T extends types.Node>(node: types.Node, isType: (node: types.Node) => node is T): T[];
declare function isCallExpression(node: types.Node): node is types.CallExpression | types.OptionalCallExpression;
declare function getText(code: string, node: types.Node): string;
declare function findNodeAt<T extends types.Node>(code: string, start: number, isType: (node: types.Node) => node is T, options: ParseOptions): T | undefined;

export { type ParseOptions, addsSyntaxErrors, countSyntaxErrors, countSyntaxErrorsExceptSkippedCommas, findNodeAt, getChildNodes, getDescendants, getText, isCallExpression, parseMaskingLines, parseModule, parseTransformInput };
