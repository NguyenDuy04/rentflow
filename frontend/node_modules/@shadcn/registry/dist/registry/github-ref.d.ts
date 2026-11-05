import { ResolvedItemAddress, ResolvedGitHubRegistrySource } from './address.js';

type GitHubItemAddress = Extract<ResolvedItemAddress, {
    scheme: "github";
}>;
type GitHubSource = GitHubItemAddress | ResolvedGitHubRegistrySource;
type GitHubRefResolverOptions = {
    cache?: Map<string, Promise<string>>;
    authAnchor?: object;
};
declare function resolveGitHubRef(address: GitHubSource, options?: GitHubRefResolverOptions): Promise<string>;
declare function getGitHubRefCandidates(ref: string): string[];
declare function getPreferredGitHubRefNames(ref: string): string[];
declare function parseGitLsRemote(stdout: string): Map<string, string>;

export { type GitHubRefResolverOptions, type GitHubSource, getGitHubRefCandidates, getPreferredGitHubRefNames, parseGitLsRemote, resolveGitHubRef };
