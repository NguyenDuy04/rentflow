import { types } from '@babel/core';
import { ParseOptions } from './parse.js';
import '@babel/parser';

interface ListChild {
    kind: "item" | "comma" | "comment";
    pos: number;
    start: number;
    startWithJsDoc: number;
    end: number;
}
interface CommaSeparatedList {
    nodeStart: number;
    pos: number;
    closeStart: number;
    children: ListChild[];
}
declare function getListChildren(code: string, pos: number, closeStart: number, items: (types.Node | null)[], getStartWithJsDoc?: (item: types.Node, pos: number) => number): ListChild[];
declare function isItem(child: ListChild): boolean;
declare function verifyIndex(index: number, length: number): void;
declare function insertIntoCommaSeparatedNodes(code: string, list: CommaSeparatedList, currentNodes: ListChild[], insertIndex: number, text: string, { useNewLines, surroundWithSpaces, }: {
    useNewLines?: boolean;
    surroundWithSpaces?: boolean;
}, options: ParseOptions): string;
declare function removeCommaSeparatedChild(code: string, list: CommaSeparatedList, child: ListChild, options: ParseOptions): string;
type Member = types.Node | null;
declare function verifyRemoval(members: Member[], index: number, editedMembers: Member[] | undefined): void;
declare function appendCommaToText(text: string): string;

export { type CommaSeparatedList, type ListChild, appendCommaToText, getListChildren, insertIntoCommaSeparatedNodes, isItem, removeCommaSeparatedChild, verifyIndex, verifyRemoval };
