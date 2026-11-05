import { types } from '@babel/core';

declare function setInitializer(code: string, declaration: types.VariableDeclarator, initializer: string): string;

export { setInitializer };
