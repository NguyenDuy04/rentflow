type ResolvedItemAddress = {
    scheme: "shadcn";
    item: string;
} | {
    scheme: "namespace";
    namespace: string;
    item: string;
} | {
    scheme: "url";
    url: string;
} | {
    scheme: "file";
    path: string;
} | {
    scheme: "github";
    owner: string;
    repo: string;
    item: string;
    ref?: string;
};
type ResolvedGitHubRegistrySource = {
    owner: string;
    repo: string;
    ref?: string;
};
declare function resolveItemAddress(address: string): {
    scheme: "github";
    owner: string;
    repo: string;
    item: string;
    ref: string | undefined;
} | {
    scheme: "url";
    url: string;
    path?: undefined;
    namespace?: undefined;
    item?: undefined;
} | {
    scheme: "file";
    path: string;
    url?: undefined;
    namespace?: undefined;
    item?: undefined;
} | {
    scheme: "namespace";
    namespace: string;
    item: string;
    url?: undefined;
    path?: undefined;
} | {
    scheme: "shadcn";
    item: string;
    url?: undefined;
    path?: undefined;
    namespace?: undefined;
};
declare function isGitHubItemAddress(address: string): boolean;
declare function resolveGitHubRegistrySource(source: string): {
    owner: string;
    repo: string;
    ref: string | undefined;
} | null;
declare function isGitHubRegistrySource(source: string): boolean;

export { type ResolvedGitHubRegistrySource, type ResolvedItemAddress, isGitHubItemAddress, isGitHubRegistrySource, resolveGitHubRegistrySource, resolveItemAddress };
