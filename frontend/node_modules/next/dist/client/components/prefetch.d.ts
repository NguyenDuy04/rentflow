import type { RootRouteTree } from './segment-cache/cache';
import type { CacheNode } from '../../shared/lib/app-router-types';
import type { PrefetchOptions } from '../../shared/lib/app-router-context.shared-runtime';
import { type PrefetchTaskFetchStrategy } from './segment-cache/types';
/**
 * The public prefetch operation, exposed through `router.prefetch`. Converts
 * the public options into a fetch strategy, reads the current router state,
 * and drives the Segment Cache.
 *
 * Unlike the old implementation, the Segment Cache doesn't store its data in
 * the router reducer state; it writes into a global mutable cache. So we
 * don't need to dispatch an action.
 */
export declare function prefetchRoute(href: string, options?: PrefetchOptions): void;
/**
 * Entrypoint for prefetching a URL into the Segment Cache.
 * @param href - The URL to prefetch. Typically this will come from a <Link>,
 * or router.prefetch. It must be validated before we attempt to prefetch it.
 * @param nextUrl - A special header used by the server for interception routes.
 * Roughly corresponds to the current URL.
 * @param renderTreeAtTimeOfPrefetch - The active render tree and head, and
 * their vary paths.
 * @param fetchStrategy - Whether to prefetch dynamic data, in addition to
 * static data. This is used by `<Link prefetch={true}>`.
 * @param onInvalidate - A callback that will be called when the prefetch cache
 * When called, it signals to the listener that the data associated with the
 * prefetch may have been invalidated from the cache. This is not a live
 * subscription — it's called at most once per `prefetch` call. The only
 * supported use case is to trigger a new prefetch inside the listener, if
 * desired. It also may be called even in cases where the associated data is
 * still cached. Prefetching is a poll-based (pull) operation, not an event-
 * based (push) one. Rather than subscribe to specific cache entries, you
 * occasionally poll the prefetch cache to check if anything is missing.
 */
export declare function prefetch(href: string, nextUrl: string | null, renderTreeAtTimeOfPrefetch: RootRouteTree<CacheNode>, fetchStrategy: PrefetchTaskFetchStrategy, onInvalidate: null | (() => void)): void;
