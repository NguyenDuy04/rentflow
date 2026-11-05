import { types } from '@babel/core';
import { ParseOptions } from './parse.js';
import '@babel/parser';

type ObjectMember = types.ObjectExpression["properties"][number];
declare function getPropertyName(code: string, member: ObjectMember): string | undefined;
declare function getProperty(code: string, object: types.ObjectExpression, name: string): types.ObjectMethod | types.ObjectProperty | undefined;
declare function isPropertyAssignment(member: ObjectMember): member is types.ObjectProperty & {
    shorthand: false;
};
declare function insertPropertyAssignment(code: string, object: types.ObjectExpression, index: number, name: string, initializer: string, options: ParseOptions): string;
declare function addPropertyAssignment(code: string, object: types.ObjectExpression, name: string, initializer: string, options: ParseOptions): string;
declare function insertSpreadAssignment(code: string, object: types.ObjectExpression, index: number, expression: string, options: ParseOptions): string;
declare function removeProperty(code: string, object: types.ObjectExpression, member: ObjectMember, options: ParseOptions): string;

export { addPropertyAssignment, getProperty, getPropertyName, insertPropertyAssignment, insertSpreadAssignment, isPropertyAssignment, removeProperty };
