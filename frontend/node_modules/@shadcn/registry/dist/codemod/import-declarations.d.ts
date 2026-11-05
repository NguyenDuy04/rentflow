import { types } from '@babel/core';

declare function getImportDeclarationSources(code: string): types.StringLiteral[];
declare function rewriteImportDeclarationSources(code: string, rewrite: (moduleSpecifier: string) => Promise<string | undefined>): Promise<string>;

export { getImportDeclarationSources, rewriteImportDeclarationSources };
