import { Config } from '../get-config.js';
import { registryConfigItemSchema } from './schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

declare function extractEnvVarsFromRegistryConfig(config: z.infer<typeof registryConfigItemSchema>): string[];
declare function validateRegistryConfig(registryName: string, config: z.infer<typeof registryConfigItemSchema>): void;
declare function validateRegistryConfigForItems(items: string[], config?: Config): void;

export { extractEnvVarsFromRegistryConfig, validateRegistryConfig, validateRegistryConfigForItems };
