/**
 * When `partialPrefetching` is enabled, this function allows you to indicate
 * that the subsequent code should be excluded from the shell. It will be deferred until
 * a prefetch (i.e. when using `<Link prefetch={true}>`) or a navigation.
 *
 * It has no effect during static prerendering — static output is computed
 * once and shared across many clients, so there's no per-request cost to
 * save — and no effect on the initial load of a page.
 *
 * Unlike `connection()`, it does not mark the subtree as request-dependent —
 * content below `await prefetch()` remains fully cacheable.
 *
 * Read more: [Next.js Docs: `prefetch`](https://nextjs.org/docs/app/api-reference/functions/prefetch)
 */
export declare function prefetch(): Promise<void>;
/**
 * This function allows you to indicate that the subsequent code should be
 * deferred to the actual navigation instead of rendering during a runtime
 * prefetch. Runtime prefetches are rendered per-user, per-link, so deferring
 * content below `await navigation()` saves that per-request
 * rendering cost.
 *
 * It has no effect during static prerendering — static output is computed
 * once and shared across many clients, so there's no per-request cost to
 * save — and no effect on the initial load of a page.
 *
 * Unlike `connection()`, it does not mark the subtree as request-dependent —
 * content below `await navigation()` remains fully cacheable.
 *
 * Read more: [Next.js Docs: `navigation`](https://nextjs.org/docs/app/api-reference/functions/navigation)
 */
export declare function navigation(): Promise<void>;
