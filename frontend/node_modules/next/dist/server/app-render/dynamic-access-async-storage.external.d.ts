import type { AsyncLocalStorage } from 'async_hooks';
import { dynamicAccessAsyncStorageInstance } from './dynamic-access-async-storage-instance';
export interface DynamicAccessAsyncStore {
    readonly abortController: AbortController;
    reason: DynamicAccessReason | null;
}
export type DynamicAccessReason = 'fallback-params' | 'runtime';
export type DynamicAccessStorage = AsyncLocalStorage<DynamicAccessAsyncStore>;
export { dynamicAccessAsyncStorageInstance as dynamicAccessAsyncStorage };
export declare function abortOnDynamicAccess(reason: DynamicAccessReason, error: Error): void;
