// Share the instance module in the next-shared layer
import { dynamicAccessAsyncStorageInstance } from './dynamic-access-async-storage-instance' with {
    'turbopack-transition': 'next-shared'
};
export { dynamicAccessAsyncStorageInstance as dynamicAccessAsyncStorage };
export function abortOnDynamicAccess(reason, error) {
    const store = dynamicAccessAsyncStorageInstance.getStore();
    if (store !== undefined) {
        // A cache may read both kinds of data before cancellation finishes. Only
        // fallback-only dependencies can become static when the params are known.
        if (store.reason !== 'runtime') {
            store.reason = reason;
        }
        store.abortController.abort(error);
    }
}

//# sourceMappingURL=dynamic-access-async-storage.external.js.map