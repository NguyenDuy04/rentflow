/**
 * When passing cross-root symlinks from Turbopack's additional roots feature to
 * the adapter, we may need to rewrite the symlink target's relative path.
 *
 * Adapters receive a map of `{"destination": "source"}` file paths, and they
 * copy symlink paths verbatim.
 *
 * We must write a "synthetic" symlink at a source path (inside
 * `.next/adapter/synthetic_symlinks`) for the adapter to copy to its output
 * artifact (e.g. a Lambda zip file).
 *
 * As a future optimization, we could pass symlink information directly to the
 * adapter, if the adapter signals that it supports accepting that information.
 * That would avoid a lot of small filesystem operations.
 */
export declare class SyntheticSymlinkManager {
    private readonly stagingRoot;
    private readonly stagedLinkNames;
    constructor(stagingRoot: string);
    createLink(source: string, linkTarget: string, targetHash: string): string;
}
export declare function createAdapterSyntheticSymlinkDirectory(distDir: string): SyntheticSymlinkManager;
