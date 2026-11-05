declare function loadEnvFiles(cwd?: string, options?: {
    processEnv?: NodeJS.ProcessEnv;
}): Promise<NodeJS.ProcessEnv>;

export { loadEnvFiles };
