import type { FormattedRuntimeError, RuntimeErrorStateError, RuntimeErrorStateUpdate } from './hot-reloader-types';
import { type RuntimeErrorStateMessage } from './hot-reloader-types';
type RuntimeErrorStateFormatter = (errors: readonly RuntimeErrorStateError[], isAppDirectory: boolean) => Promise<FormattedRuntimeError[]>;
export declare function formatRuntimeErrors(errors: readonly RuntimeErrorStateError[], isAppDirectory: boolean): Promise<FormattedRuntimeError[]>;
export declare function isRuntimeErrorStateUpdate(value: unknown): value is RuntimeErrorStateUpdate;
export declare function createRuntimeErrorStateHandler(sendHmrMessage: (message: RuntimeErrorStateMessage) => void, format?: RuntimeErrorStateFormatter, clientId?: string): {
    handle(update: unknown): Promise<void>;
    dispose(): void;
};
export {};
