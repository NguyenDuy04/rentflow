/**
 * Create or update AGENTS.md with managed Next.js instructions when `next dev`
 * detects an AI coding agent.
 *
 * Keep the marker and block content in sync with:
 *   - packages/create-next-app/helpers/generate-agent-files.ts
 *   - packages/next-codemod/lib/agents-md.ts
 */
export declare const AGENT_RULES_START_MARKER = "<!-- BEGIN:nextjs-agent-rules -->";
export declare const AGENT_RULES_END_MARKER = "<!-- END:nextjs-agent-rules -->";
export declare const AGENT_FEEDBACK_START_MARKER = "<!-- BEGIN:nextjs-agent-feedback -->";
export declare const AGENT_FEEDBACK_END_MARKER = "<!-- END:nextjs-agent-feedback -->";
export type AgentFileAction = 'created' | 'updated' | 'removed' | 'unchanged' | 'skipped';
export interface AgentFilesResult {
    agentsMd: AgentFileAction;
}
/**
 * Returns true when `AGENTS.md` at `dir` already contains the current
 * agent-rules block. A block from an earlier
 * Next.js version (older wording, legacy markers) returns false so
 * callers know to upsert the current one over it.
 */
export declare function hasCurrentAgentRules(dir: string): boolean;
export declare function hasCurrentAgentFeedback(dir: string): boolean;
/**
 * Write the agent-rules block into `AGENTS.md` in `projectDir`.
 *
 * Idempotent: a file already containing the canonical block is
 * reported as `unchanged`.
 */
export declare function writeAgentFiles(projectDir: string): AgentFilesResult;
/**
 * Write the opt-in agent-feedback block into AGENTS.md, alongside the managed
 * agent-rules block when both are enabled.
 */
export declare function writeAgentFeedbackFiles(projectDir: string): AgentFilesResult;
/**
 * Remove only the managed agent-feedback block, leaving all other content.
 * A file that held nothing but the block is deleted rather than left empty.
 */
export declare function removeAgentFeedbackFiles(projectDir: string): AgentFilesResult;
/**
 * Remove only the managed agent-rules block, leaving all other content.
 * A file that held nothing but the block is deleted rather than left empty.
 */
export declare function removeAgentRulesFiles(projectDir: string): AgentFilesResult;
