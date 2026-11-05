/**
 * Used in unit test.
 * @ignore
 */
export declare function calcBackoffMs(attempt: number): number;
/**
 * Recursively delete directory contents.
 *
 * This is used when cleaning the `distDir`, and is part of the critical path
 * for starting the server, so we use synchronous file IO, as we're always
 * blocked on it anyways.
 *
 * Despite using sync IO, the function signature is still `async` because we
 * asynchronously perform retries.
 */
export declare function recursiveDeleteSyncWithAsyncRetries(
/** Directory to delete the contents of */
dir: string, 
/** Exclude based on relative file path */
exclude?: ReadonlySet<string>, 
/**
 * Only delete files whose mtime is at least this old. Directories are
 * removed once empty.
 */
maxAgeMs?: number): Promise<void>;
