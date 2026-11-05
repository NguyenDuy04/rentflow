import { types } from '@babel/core';
import { ParseOptions } from './parse.js';
import '@babel/parser';

declare function insertElement(code: string, array: types.ArrayExpression, index: number, text: string, options: ParseOptions): string;
declare function addElement(code: string, array: types.ArrayExpression, text: string, options: ParseOptions): string;
declare function removeElement(code: string, array: types.ArrayExpression, index: number, options: ParseOptions): string;

export { addElement, insertElement, removeElement };
