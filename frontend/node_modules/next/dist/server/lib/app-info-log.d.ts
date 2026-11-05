import type { ConfiguredExperimentalFeature } from '../config';
import { type AgentFilesResult } from './generate-agent-files';
export type { ConfiguredExperimentalFeature };
/**
 * Logs basic startup info that doesn't require config.
 * Called before "Ready in X" to show immediate feedback.
 */
export declare function logStartInfo({ networkUrl, appUrl, envInfo, logBundler, }: {
    networkUrl: string | null;
    appUrl: string | null;
    envInfo?: string[];
    logBundler: boolean;
}): void;
/**
 * Logs experimental features and config-dependent info.
 * Called after getRequestHandlers completes.
 */
export declare function logExperimentalInfo({ experimentalFeatures, cacheComponents, partialPrefetching, }: {
    experimentalFeatures?: ConfiguredExperimentalFeature[];
    cacheComponents?: boolean;
    partialPrefetching?: boolean;
}): void;
/**
 * Keep the agent-rules block in sync with next.config. Enabling it still
 * requires a detected agent; disabling it removes only that managed block,
 * even when no agent is currently detected.
 */
export declare function syncAgentRulesForDev(dir: string, enabled: boolean): Promise<AgentFilesResult | null>;
/**
 * Keep the opt-in agent-feedback block in sync with next.config. Enabling it
 * still requires a detected agent; disabling it removes only that managed
 * block, even when no agent is currently detected.
 */
export declare function syncAgentFeedbackForDev(dir: string, enabled: boolean): Promise<AgentFilesResult | null>;
/**
 * Gets environment info for logging. Fast operation that doesn't require config.
 */
export declare function getEnvInfo(dir: string): string[];
