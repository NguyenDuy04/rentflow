import { types } from '@babel/core';
import { NodeOrComment } from './comment-nodes.js';
import { TextEdit } from './edits.js';
import './parse.js';
import '@babel/parser';

type Statement = NodeOrComment<types.Statement | types.Directive>;
declare function getStatementsWithComments(code: string, program: types.Program): Statement[];
declare function insertStatement(code: string, statements: Statement[], index: number, statementText: string, isSameKind: (statement: Statement) => boolean): {
    code: string;
    end: number;
};
declare function removeStatement(code: string, statements: Statement[], index: number): string;
declare function addImportDeclaration(code: string, moduleSpecifier: string, name: string): string;
declare function getImportDeclarationInsertion(code: string, text: string): TextEdit;
declare function isImportDeclaration(statement: Statement): boolean;

export { type Statement, addImportDeclaration, getImportDeclarationInsertion, getStatementsWithComments, insertStatement, isImportDeclaration, removeStatement };
