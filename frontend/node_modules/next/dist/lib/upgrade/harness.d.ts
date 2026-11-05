import type { AgentUpgradeHandoffMethod } from '../../telemetry/events/agent-upgrade';
type UpgradePrompt = string | ((useWorktree: boolean | null) => string);
export declare function handoffUpgrade(prompt: UpgradePrompt, directory: string, onHandoff: ((method: AgentUpgradeHandoffMethod, selectedAgentProduct: string | null) => void) | null): Promise<'handed_off' | 'cancelled' | 'failed'>;
export {};
