export declare class InvalidDistDirError extends Error {
    constructor(distDir: string, appDir: string, workspaceRoot: string);
}
/**
 * Throws unless `distDir` is inside the application or workspace, without
 * containing the application itself.
 */
export declare function verifyDistDir(distDir: string, appDir: string, workspaceRoot: string): void;
