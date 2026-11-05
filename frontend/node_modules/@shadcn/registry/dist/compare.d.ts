declare function isContentSame(existingContent: string, newContent: string, options?: {
    ignoreImports?: boolean;
}): boolean;

export { isContentSame };
