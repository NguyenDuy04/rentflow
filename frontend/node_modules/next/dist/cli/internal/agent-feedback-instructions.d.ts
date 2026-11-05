type IsEnabled = () => Promise<boolean>;
type IsLocallyEnabled = () => boolean;
type ReadProtocol = () => Promise<string>;
export interface AgentFeedbackInstructionsOptions {
    dryRun?: boolean;
}
type LoadInstructions = (options?: AgentFeedbackInstructionsOptions) => Promise<string | null>;
export declare function loadAgentFeedbackInstructions(options?: AgentFeedbackInstructionsOptions, isEnabled?: IsEnabled, readProtocol?: ReadProtocol, isLocallyEnabled?: IsLocallyEnabled): Promise<string | null>;
export declare function agentFeedbackInstructionsCli(options?: AgentFeedbackInstructionsOptions, loadInstructions?: LoadInstructions): Promise<void>;
export {};
