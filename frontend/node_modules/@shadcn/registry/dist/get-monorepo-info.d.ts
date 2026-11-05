declare function isMonorepoRoot(cwd: string): Promise<boolean>;
declare function getMonorepoTargets(cwd: string): Promise<{
    name: string;
    hasConfig: boolean;
}[]>;
declare function formatMonorepoMessage(command: string, targets: {
    name: string;
    hasConfig: boolean;
}[], options?: {
    cwdFlag?: string;
}): void;
declare function getWorkspacePatterns(cwd: string): Promise<string[]>;
declare function parsePnpmWorkspacePackages(content: string): string[];

export { formatMonorepoMessage, getMonorepoTargets, getWorkspacePatterns, isMonorepoRoot, parsePnpmWorkspacePackages };
