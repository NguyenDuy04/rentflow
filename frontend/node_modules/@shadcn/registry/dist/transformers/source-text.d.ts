declare function stripByteOrderMark(source: string): string;
declare function getTextFromFirstToken(code: string): string;
declare function transformSourceText(source: string, transform: (code: string) => string): string;

export { getTextFromFirstToken, stripByteOrderMark, transformSourceText };
