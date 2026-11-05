declare function isWhitespace(char: string | undefined): boolean;
declare function isWhiteSpaceSingleLine(char: string | undefined): boolean;
declare function isLineBreak(char: string | undefined): boolean;
declare function getLineStart(code: string, pos: number): number;
declare function getLineEnd(code: string, pos: number): number;
declare function getPosAtStartOfLineOrNonWhitespace(code: string, pos: number): number;
declare function isNewLineAtPos(code: string, pos: number): boolean;
declare function getPosAtNextNonBlankLine(code: string, pos: number): number;
declare function getPosAtEndOfPreviousLine(code: string, pos: number): number;
declare function getCommentEnd(code: string, pos: number): number | undefined;
interface CommentRange {
    pos: number;
    end: number;
}
declare function getLeadingCommentRanges(code: string, pos: number): CommentRange[];
declare function getTrailingCommentRanges(code: string, pos: number): CommentRange[];
declare function getTrailingCommentsEnd(code: string, pos: number): number | undefined;
declare function getJsDocStart(code: string, pos: number, end: number, { includeTrailingComments }: {
    includeTrailingComments: boolean;
}): number | undefined;
declare function getTrailingTriviaEnd(code: string, end: number): number;
declare function getNextNonWhitespacePos(code: string, pos: number): number;
declare function getNonWhitespaceStart(code: string, { pos, start }: {
    pos: number;
    start: number;
}, previousSibling?: {
    end: number;
    isComment: boolean;
}): number;
declare function skipTrivia(code: string, pos: number): number;

export { getCommentEnd, getJsDocStart, getLeadingCommentRanges, getLineEnd, getLineStart, getNextNonWhitespacePos, getNonWhitespaceStart, getPosAtEndOfPreviousLine, getPosAtNextNonBlankLine, getPosAtStartOfLineOrNonWhitespace, getTrailingCommentRanges, getTrailingCommentsEnd, getTrailingTriviaEnd, isLineBreak, isNewLineAtPos, isWhiteSpaceSingleLine, isWhitespace, skipTrivia };
