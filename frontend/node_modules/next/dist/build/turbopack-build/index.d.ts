import type { Telemetry } from '../../telemetry/storage';
import { turbopackBuild as turbopackBuildImpl } from './impl';
export declare function turbopackBuild(telemetry: Telemetry): ReturnType<typeof turbopackBuildImpl>;
