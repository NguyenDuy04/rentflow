declare function isEnvFile(filePath: string): boolean;
declare function findExistingEnvFile(targetDir: string): string | null;
declare function parseEnvContent(content: string): Record<string, string>;
declare function getNewEnvKeys(existingContent: string, newContent: string): string[];
/**
 * Merge env content by appending ONLY new keys that don't exist in the existing content.
 * Existing keys are preserved with their original values.
 */
declare function mergeEnvContent(existingContent: string, newContent: string): string;

export { findExistingEnvFile, getNewEnvKeys, isEnvFile, mergeEnvContent, parseEnvContent };
