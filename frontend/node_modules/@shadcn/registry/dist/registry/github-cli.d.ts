import { GitHubSource } from './github-ref.js';
import './address.js';

declare const MAX_GITHUB_SOURCE_FILE_SIZE: number;
type GitHubAuthMode = "token" | "gh";
type GitHubFailureKind = "http" | "network" | "timeout" | "enoent" | "unauthenticated" | "oversize" | "invalid-response";
declare class GitHubTransportError extends Error {
    readonly kind: GitHubFailureKind;
    readonly statusCode?: number;
    constructor(kind: GitHubFailureKind, options?: {
        statusCode?: number;
        message?: string;
    });
}
declare function getEnvGitHubToken(): string | null;
declare function encodeGitHubPath(path: string): string;
declare function isValidGitHubSha(sha: unknown): sha is string;
declare function readGitHubResponseTextWithLimit(response: Response, limit?: number): Promise<string>;
declare function fetchGitHubFileViaRest(address: GitHubSource, sha: string, filePath: string, token: string): Promise<string>;
declare function fetchGitHubFileViaGh(address: GitHubSource, sha: string, filePath: string): Promise<string>;
declare function getGitHubTransportFailureGuidance(error: GitHubTransportError, mode: GitHubAuthMode): {
    detail: string;
    suggestion: string;
};
declare function resolveGitHubRefViaAuth(address: GitHubSource, ref: string, mode: GitHubAuthMode): Promise<string>;

export { type GitHubAuthMode, type GitHubFailureKind, GitHubTransportError, MAX_GITHUB_SOURCE_FILE_SIZE, encodeGitHubPath, fetchGitHubFileViaGh, fetchGitHubFileViaRest, getEnvGitHubToken, getGitHubTransportFailureGuidance, isValidGitHubSha, readGitHubResponseTextWithLimit, resolveGitHubRefViaAuth };
