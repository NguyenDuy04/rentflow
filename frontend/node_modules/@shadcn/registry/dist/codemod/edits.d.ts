import { types } from '@babel/core';
import { ParseOptions } from './parse.js';
import '@babel/parser';

interface TextEdit {
    start: number;
    end: number;
    text: string;
}
declare function applyEdits(code: string, edits: TextEdit[]): string;
declare function getTextEdit(code: string, edited: string): TextEdit;
declare class SyntaxErrorInsertedError extends Error {
    constructor();
}
declare class ForgottenNodeError extends Error {
    constructor();
}
type SkipReason = "unparsable" | "syntax-error-inserted";
declare function applyManipulation(code: string, edits: TextEdit[], options?: ParseOptions): string;
declare function replaceWithText(code: string, node: types.Node, text: string, options: ParseOptions): string;

export { ForgottenNodeError, type SkipReason, SyntaxErrorInsertedError, type TextEdit, applyEdits, applyManipulation, getTextEdit, replaceWithText };
