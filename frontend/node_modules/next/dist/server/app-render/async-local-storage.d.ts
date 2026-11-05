import type { AsyncLocalStorage } from 'async_hooks';
export declare function createAsyncLocalStorage<Store extends {}>(): AsyncLocalStorage<Store>;
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
 */
export declare function getOrCreateGlobalAsyncLocalStorage<Store extends {}>(name: string): AsyncLocalStorage<Store>;
export declare function bindSnapshot<T>(fn: T): T;
export declare function createSnapshot(): <R, TArgs extends any[]>(fn: (...args: TArgs) => R, ...args: TArgs) => R;
