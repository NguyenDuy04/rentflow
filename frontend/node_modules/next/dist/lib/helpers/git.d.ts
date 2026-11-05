/**
 * Returns the current git branch name for the given working directory, or
 * undefined if it cannot be determined (not a git repo, detached HEAD,
 * git not installed, etc.). Prefers VERCEL_GIT_COMMIT_REF when set.
 */
export declare function getGitBranch(cwd: string): string | undefined;
/**
 * Returns the current git commit SHA for the given working directory, or
 * undefined if it cannot be determined. Prefers VERCEL_GIT_COMMIT_SHA when
 * set.
 */
export declare function getGitCommit(cwd: string): string | undefined;
/**
 * Returns true if the working tree has uncommitted changes. Returns undefined
 * when the dirty status cannot be determined (not a git repo, git not
 * installed, etc.).
 */
export declare function getGitDirty(cwd: string): boolean | undefined;
/**
 * Returns the first line of the HEAD commit message, or undefined when it
 * cannot be determined. Prefers VERCEL_GIT_COMMIT_MESSAGE when set.
 */
export declare function getGitMessage(cwd: string): string | undefined;
