import { Config } from '../get-config.js';
import { registryItemEnvVarsSchema } from '../registry/schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

declare function updateEnvVars(envVars: z.infer<typeof registryItemEnvVarsSchema> | undefined, config: Config, options: {
    silent?: boolean;
}): Promise<{
    envVarsAdded: string[];
    envFileUpdated: string | null;
    envFileCreated: string | null;
}>;

export { updateEnvVars };
