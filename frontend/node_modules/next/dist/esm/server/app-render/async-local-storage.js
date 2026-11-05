const sharedAsyncLocalStorageNotAvailableError = new Error('Invariant: AsyncLocalStorage accessed in runtime where it is not available');
class FakeAsyncLocalStorage {
    disable() {
        throw sharedAsyncLocalStorageNotAvailableError;
    }
    getStore() {
        // This fake implementation of AsyncLocalStorage always returns `undefined`.
        return undefined;
    }
    run() {
        throw sharedAsyncLocalStorageNotAvailableError;
    }
    exit() {
        throw sharedAsyncLocalStorageNotAvailableError;
    }
    enterWith() {
        throw sharedAsyncLocalStorageNotAvailableError;
    }
    static bind(fn) {
        return fn;
    }
}
const maybeGlobalAsyncLocalStorage = typeof globalThis !== 'undefined' && globalThis.AsyncLocalStorage;
export function createAsyncLocalStorage() {
    if (maybeGlobalAsyncLocalStorage) {
        return new maybeGlobalAsyncLocalStorage();
    }
    return new FakeAsyncLocalStorage();
}
/**
 * Returns the storage registered under `name`, and creates it on first use.
 *
 * These storages must be singletons within a realm. A store that is entered
 * through one reference to a storage must be readable through every other
 * reference to it. If it is not, code that runs inside the scope sees no store
 * at all. Module identity does not guarantee this. A realm can evaluate the
 * same `next` file more than once if the package is reachable through more than
 * one path, and then each evaluation creates a storage of its own. A global
 * symbol keeps the singleton intact for any number of copies. Worker threads
 * and edge sandboxes still get separate storages, because each of them has its
 * own `globalThis`.
 *
 * Module identity broke this way in `next dev`. A bug in Node's
 * `fs.realpathSync` can return a path with its symlinks unresolved, and the
 * module loader keys the module cache on that path. On a pnpm install it then
 * resolves `next/dist/...` through the `node_modules/next` symlink instead of
 * the real path, so the file is evaluated a second time. See
 * https://github.com/nodejs/node/pull/65113. Node versions without that fix
 * stay affected.
 *
 * The key includes the Next.js version, so two different versions of Next.js in
 * the same realm keep separate storages. Their store shapes might not be
 * compatible.
 */ export function getOrCreateGlobalAsyncLocalStorage(name) {
    const key = Symbol.for(`@next/${name}@${"16.4.5"}`);
    const globalStore = globalThis;
    return globalStore[key] ??= createAsyncLocalStorage();
}
export function bindSnapshot(// WARNING: Don't pass a named function to this argument! See: https://github.com/facebook/react/pull/34911
fn) {
    if (maybeGlobalAsyncLocalStorage) {
        return maybeGlobalAsyncLocalStorage.bind(fn);
    }
    return FakeAsyncLocalStorage.bind(fn);
}
export function createSnapshot() {
    if (maybeGlobalAsyncLocalStorage) {
        return maybeGlobalAsyncLocalStorage.snapshot();
    }
    return function(fn, ...args) {
        return fn(...args);
    };
}

//# sourceMappingURL=async-local-storage.js.map