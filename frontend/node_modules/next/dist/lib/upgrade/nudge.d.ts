import type { NextConfigComplete } from '../../server/config-shared';
import type { Telemetry } from '../../telemetry/storage';
import type { UpgradeAction } from './prompt';
export type NudgeKind = 'security' | 'latest' | 'experimental-future';
export type UpgradeContext = Pick<NextConfigComplete, 'distDir' | 'cacheComponents'> & {
    configuredPolicy: NudgeKind | false | null;
    experimental: {
        agentUpgrade: NudgeKind | false;
    };
};
export type UpgradeReminder = {
    policy: NudgeKind;
    installedVersion: string;
} & ({
    kind: 'security';
    reference: string | null;
    targetVersion: string;
} | {
    kind: 'latest';
    latestVersion: string | null;
    names: string[];
} | {
    kind: 'experimental-future';
    targetVersion: string;
    names: string[];
});
export declare function getUpgradeContext(config: NextConfigComplete): UpgradeContext;
export declare function assessUpgrade(directory: string, config: UpgradeContext, installedVersion?: string, stopBefore?: NudgeKind | null, forceVersionReminder?: boolean): Promise<UpgradeReminder | null>;
export declare function runUpgrade(directory: string, policy: NudgeKind, nudgeId: string | null): Promise<string | number>;
export declare function shouldPromptForUpgrade(): Promise<boolean>;
export declare function nudgeUpgrade(directory: string, config: UpgradeContext, command: 'dev' | 'build', signal: AbortSignal | null, initialAssessment: Promise<UpgradeReminder | null> | null, telemetryOptions: {
    telemetry: Telemetry;
    onNudgeId: ((nudgeId: string) => void) | null;
} | null): Promise<UpgradeAction | void>;
