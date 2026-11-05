import type { EnsureStatic } from '../../../build/segment-config/app/app-segment-config';
import { type LoaderTree } from '../../lib/app-dir-module';
/**
 * The outcome of resolving a route's `ensureStatic` config.
 * The ordering is intentional -- higher values indicate a
 * more constrained route that forces more request kinds to be static.
 *
 * A constraint also implies all its predecessors:
 * - `Prefetch` implies `Shell`, i.e. if prefetches are static, so are shells.
 * - `Navigation` implies `Prefetch` and `Shell`, i.e. if the whole page is static,
 *   then so are its shells and prefetches.
 *
 * Note that this flattens `"auto"` and `false` into `None`.
 * This is because rendering code does not need to distinguish them --
 * both indicate that the route follows normal Partial Prefetching semantics
 * and does not force anything to be static.
 * However, it is only correct to collapse them into one *after* resolving the
 * config for the entire route, because they have different interactions with
 * configs from other segments on the same route.
 */
export declare enum EnsureStaticLevel {
    /** The route follows standard Partial Prefetching semantics. */
    None = 0,
    /** The route requires that app shells must be statically prerendered. */
    Shell = 1,
    /** The route requires that app shells and prefetches must be statically prerendered. */
    Prefetch = 2,
    /** The route requires that app shells, prefetches, and the whole page must be statically prerendered. */
    Navigation = 3
}
export declare function resolveEnsureStaticLevel(tree: LoaderTree, partialPrefetching: boolean): Promise<EnsureStaticLevel>;
export declare function resolveEnsureStaticConfig(tree: LoaderTree, partialPrefetching: boolean): Promise<Exclude<EnsureStatic, false>>;
