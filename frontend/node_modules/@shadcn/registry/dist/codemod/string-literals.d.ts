import { types } from '@babel/core';
import { TextEdit } from './edits.js';
import './parse.js';
import '@babel/parser';

type StringLiteral = types.StringLiteral | types.DirectiveLiteral;
type Literal = StringLiteral | types.TemplateLiteral;
declare class StringLiterals {
    private readonly code;
    private readonly strings;
    private readonly templates;
    private readonly jsxAttributeValues;
    private readonly edits;
    constructor(code: string, file: types.File);
    getStringLiterals(container?: types.Node): StringLiteral[];
    getTemplateLiterals(container?: types.Node): types.TemplateLiteral[];
    getValue(literal: Literal): string;
    setValue(literal: Literal, value: string): void;
    getEdits(): TextEdit[];
    apply(): string;
}
declare function getSetLiteralValueEdit(code: string, literal: Literal, value: string): TextEdit;

export { type Literal, StringLiterals, getSetLiteralValueEdit };
