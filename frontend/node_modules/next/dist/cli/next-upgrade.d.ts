type NextUpgradeOptions = {
    revision: string;
    verbose: boolean;
    agent: boolean | string | undefined;
};
export declare function spawnNextUpgrade(directory: string | undefined, options: NextUpgradeOptions, nudgeSource: {
    id: string;
    recipient: 'human' | 'agent';
} | null): Promise<void>;
export declare function reportAgentUpgradeAgentResult(runId: string, result: string): Promise<void>;
export {};
