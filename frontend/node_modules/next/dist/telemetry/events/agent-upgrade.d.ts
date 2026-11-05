export type AgentUpgradePolicy = 'security' | 'latest' | 'experimental-future';
export type AgentUpgradeOrigin = 'human_manual' | 'human_nudge' | 'agent_manual' | 'agent_nudge';
export type AgentUpgradeHandoffMethod = 'existing_agent' | 'launched_agent' | 'copied_prompt' | 'printed_prompt';
export type AgentUpgradeCLIResult = 'no_update_needed' | 'no_safe_target' | 'metadata_failure' | 'guide_failure' | 'cancelled' | 'handoff_issued' | 'handoff_failed' | 'cli_failure';
export declare function eventAgentUpgradePolicyDetected(fields: {
    configuredPolicy: AgentUpgradePolicy | false | null;
    effectivePolicy: AgentUpgradePolicy;
    policySource: 'config' | 'environment';
    sourceCommand: 'dev' | 'build';
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        configuredPolicy: AgentUpgradePolicy | false | null;
        effectivePolicy: AgentUpgradePolicy;
        policySource: "config" | "environment";
        sourceCommand: "dev" | "build";
    };
};
export declare function eventAgentUpgradeNudgeShown(fields: {
    nudgeId: string;
    recipient: 'human' | 'agent';
    agentProduct: string | null;
    sourceCommand: 'dev' | 'build';
    policy: AgentUpgradePolicy;
    nudgeKind: AgentUpgradePolicy;
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        nudgeId: string;
        recipient: "human" | "agent";
        agentProduct: string | null;
        sourceCommand: "dev" | "build";
        policy: AgentUpgradePolicy;
        nudgeKind: AgentUpgradePolicy;
    };
};
export declare function eventAgentUpgradeNudgeDecision(fields: {
    nudgeId: string;
    action: 'update' | 'skip' | 'dismiss' | 'interrupt';
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        nudgeId: string;
        action: "update" | "skip" | "dismiss" | "interrupt";
    };
};
export declare function eventAgentUpgradeRunStarted(fields: {
    runId: string;
    nudgeId: string | null;
    origin: AgentUpgradeOrigin;
    agentProduct: string | null;
    requestedPolicy: AgentUpgradePolicy | null;
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        runId: string;
        nudgeId: string | null;
        origin: AgentUpgradeOrigin;
        agentProduct: string | null;
        requestedPolicy: AgentUpgradePolicy | null;
    };
};
export declare function eventAgentUpgradeCLIResult(fields: {
    runId: string;
    result: AgentUpgradeCLIResult;
    resolvedPolicy: AgentUpgradePolicy | null;
    handoffMethod: AgentUpgradeHandoffMethod | null;
    selectedAgentProduct: string | null;
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        runId: string;
        result: AgentUpgradeCLIResult;
        resolvedPolicy: AgentUpgradePolicy | null;
        handoffMethod: AgentUpgradeHandoffMethod | null;
        selectedAgentProduct: string | null;
    };
};
export declare function eventAgentUpgradeAgentResult(fields: {
    runId: string;
    result: 'success' | 'failure';
}): {
    eventName: string;
    payload: {
        schemaVersion: number;
    } & {
        runId: string;
        result: "success" | "failure";
    };
};
