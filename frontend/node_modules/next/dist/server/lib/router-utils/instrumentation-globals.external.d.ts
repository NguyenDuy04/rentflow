import type { InstrumentationModule, InstrumentationOnRequestError } from '../../instrumentation/types';
export declare function getInstrumentationModule(projectDir: string, distDir: string): Promise<InstrumentationModule | undefined>;
export declare function instrumentationOnRequestError(projectDir: string, distDir: string, ...args: Parameters<InstrumentationOnRequestError>): Promise<void>;
export declare function ensureInstrumentationRegistered(projectDir: string, distDir: string): Promise<void>;
/**
 * Like `ensureInstrumentationRegistered`, for a request that may trigger
 * registration (direct entrypoints, without next-server). When this call
 * starts registration and it succeeds, the lifecycle spans aren't emitted yet:
 * the returned function emits them in the context it's called in, so they can
 * become children of the request's span. Returns `undefined` when
 * registration was already started by another caller.
 */
export declare function ensureInstrumentationRegisteredWithDeferredSpans(projectDir: string, distDir: string): Promise<(() => void) | undefined>;
