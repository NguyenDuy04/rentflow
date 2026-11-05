import { GitHubAuthMode } from './github-cli.js';
import { GitHubSource } from './github-ref.js';
import './address.js';

type GitHubSourceAuthState = {
    decision?: Promise<GitHubAuthMode>;
    anonymousLock: boolean;
    originalError?: unknown;
};
declare function resetGitHubAuthNotices(): void;
declare function getGitHubAuthState(anchor: object, source: GitHubSource): GitHubSourceAuthState;
declare function selectGitHubAuthMode(state: GitHubSourceAuthState, source: GitHubSource, originalError: unknown): Promise<GitHubAuthMode>;

export { type GitHubSourceAuthState, getGitHubAuthState, resetGitHubAuthNotices, selectGitHubAuthMode };
