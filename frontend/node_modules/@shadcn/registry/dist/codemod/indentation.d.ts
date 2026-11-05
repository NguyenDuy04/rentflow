import { ParseOptions } from './parse.js';
import '@babel/core';
import '@babel/parser';

declare function getReplacementText(code: string, position: number, text: string, options?: ParseOptions): string;
declare function getIndentationLevel(code: string, position: number, options?: ParseOptions): number;
declare function getIndentationText(code: string, position: number, options: ParseOptions, offset?: number): string;

export { getIndentationLevel, getIndentationText, getReplacementText };
