export type UpgradeModel = {
    id: string;
    label: string;
    description: string;
    efforts: string[];
    isDefault: boolean;
};
export declare function getCodexModels(path: string, cwd: string, signal?: AbortSignal): Promise<UpgradeModel[] | null>;
export declare function getClaudeModels(path: string, cwd: string, signal?: AbortSignal): Promise<UpgradeModel[] | null>;
export declare function getHarnessModels(name: 'codex' | 'claude', path: string, cwd: string, signal?: AbortSignal): Promise<UpgradeModel[] | null>;
