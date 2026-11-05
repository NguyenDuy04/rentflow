import type { SpawnOptions } from 'child_process';
export declare function runChildProcess(command: string, args: string[], options: SpawnOptions, onSpawn: (() => void) | null): Promise<number>;
