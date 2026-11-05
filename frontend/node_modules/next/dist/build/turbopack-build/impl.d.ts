import type { Telemetry } from '../../telemetry/storage';
export declare function turbopackBuild(telemetry: Telemetry): Promise<{
    duration: number;
    buildTraceContext: undefined;
    shutdownPromise: Promise<void>;
    warnings: string[];
}>;
