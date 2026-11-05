import { types } from '@babel/core';

interface NodeOrComment<T> {
    pos: number;
    start: number;
    end: number;
    node?: T;
}
declare function getNodesWithComments<T extends types.Node>(code: string, bodyPos: number, nodes: {
    pos: number;
    node: T;
}[]): NodeOrComment<T>[];

export { type NodeOrComment, getNodesWithComments };
