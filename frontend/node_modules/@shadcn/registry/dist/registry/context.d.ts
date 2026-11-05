declare function withRegistryContext<T>(callback: () => T, options?: {
    env?: NodeJS.ProcessEnv;
    onGitHubAuthNotice?: (message: string) => void | Promise<void>;
}): T;
declare function setRegistryHeaders(headers: Record<string, Record<string, string>>): void;
declare function getRegistryHeadersFromContext(url: string): Record<string, string>;
declare function getRegistryEnvFromContext(key: string): string | undefined;
declare function getGitHubAuthNoticeFromContext(): ((message: string) => void | Promise<void>) | undefined;
declare function clearRegistryContext(): void;

export { clearRegistryContext, getGitHubAuthNoticeFromContext, getRegistryEnvFromContext, getRegistryHeadersFromContext, setRegistryHeaders, withRegistryContext };
