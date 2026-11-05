import { type FutureDefaultEntry } from './future-defaults';
type UpgradePreparation = {
    status: 'unaffected' | 'blocked' | 'unknown';
    reason: string;
} | {
    status: 'ready';
    installedVersion: string;
    targetVersion: string;
    references: string[];
    futureDefaults: FutureDefaultEntry[];
};
export declare function prepareUpgrade(directory: string, targetRequest?: string): Promise<UpgradePreparation>;
export type UpgradeAssessment = {
    affected: boolean | null;
    reference: string | null;
    upgrade: UpgradePreparation;
};
export declare function getUpgradeAssessment(installedVersion: string, policy: 'security' | 'latest' | 'experimental-future', onlyIfAffected?: boolean): Promise<UpgradeAssessment>;
export declare function getPrereleaseChannel(version: string): string | null;
export declare function getLatestUpgradeVersion(version: string, targetVersion: string): string | null;
export {};
