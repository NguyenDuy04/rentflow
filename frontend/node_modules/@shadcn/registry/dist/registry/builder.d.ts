import { Config } from '../get-config.js';
import { registryConfigItemSchema } from './schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

declare function buildUrlAndHeadersForRegistryItem(name: string, config?: Config): {
    url: string;
    headers: Record<string, string>;
} | null;
declare function buildUrlFromRegistryConfig(item: string, registryConfig: z.infer<typeof registryConfigItemSchema>, config?: Config): string;
declare function buildHeadersFromRegistryConfig(config: z.infer<typeof registryConfigItemSchema>): Record<string, string>;
/**
 * Resolves a registry URL from a path or URL string.
 * Handles special cases like v0 registry URLs that need /json suffix.
 */
declare function resolveRegistryUrl(pathOrUrl: string): string;

export { buildHeadersFromRegistryConfig, buildUrlAndHeadersForRegistryItem, buildUrlFromRegistryConfig, resolveRegistryUrl };
