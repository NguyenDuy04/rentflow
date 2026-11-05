import type { ChildProcess } from 'child_process';
import type { NudgeKind, UpgradeContext, UpgradeReminder } from './nudge';
type PromptOutput = ReturnType<typeof createPromptOutput>;
export type UpgradeMenuResult = {
    policy: NudgeKind;
    nudgeId: string | null;
} | 'interrupt' | null;
export declare function createPromptOutput(): {
    attach(child: ChildProcess): void;
    hold(): void;
    release(): void;
    discard(): void;
};
export declare function drainPromptOutput(child: ChildProcess): Promise<void>;
export declare function getPromptOutputEnv(): {
    FORCE_COLOR: string | undefined;
    NEXT_PRIVATE_PROMPT_OUTPUT: string;
    NEXT_PRIVATE_TERMINAL_COLUMNS: string | undefined;
};
export declare function reassertRawMode(): void;
export declare function showUpgradeMenu(output: PromptOutput, options: {
    dir: string;
    context: UpgradeContext;
    command: 'dev' | 'build';
    signal: AbortSignal;
    initialAssessment: Promise<UpgradeReminder | null> | null;
    telemetryDisabled: string | undefined;
}): Promise<UpgradeMenuResult>;
export declare function closedUpgradeMenu(menu: Promise<unknown> | undefined): Promise<void>;
export declare function flushUpgradeTelemetry(): Promise<void>;
export {};
