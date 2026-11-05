type PackageManager = "yarn" | "pnpm" | "bun" | "npm" | "deno";
declare function getPackageManager(targetDir: string, { withFallback }?: {
    withFallback?: boolean;
}): Promise<PackageManager>;
declare function getPackageManagerFromUserAgent(userAgent?: string): PackageManager | null;
declare function getPackageRunnerCommand(packageManager: PackageManager | null): "pnpm dlx" | "bunx" | "npx";
declare function getPackageRunner(cwd: string): Promise<"pnpm dlx" | "bunx" | "npx">;

export { type PackageManager, getPackageManager, getPackageManagerFromUserAgent, getPackageRunner, getPackageRunnerCommand };
