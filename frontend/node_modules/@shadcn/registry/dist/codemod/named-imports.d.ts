import { types } from '@babel/core';

declare function getNamedImportNames(code: string, declaration: types.ImportDeclaration): string[];
declare function addNamedImport(code: string, declaration: types.ImportDeclaration, name: string): string;
declare function removeNamedImport(code: string, declaration: types.ImportDeclaration, index: number): string;

export { addNamedImport, getNamedImportNames, removeNamedImport };
