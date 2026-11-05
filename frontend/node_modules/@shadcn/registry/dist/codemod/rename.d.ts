declare function renameVariable(code: string, declarationStart: number, newName: string): string;
declare function renameFunction(code: string, declarationStart: number, newName: string): string;

export { renameFunction, renameVariable };
