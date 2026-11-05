/**
 * Normalizes an app route so it represents the actual request path. Essentially
 * performing the following transformations:
 *
 * - `/(dashboard)/user/[id]/page` to `/user/[id]`
 * - `/(dashboard)/account/page` to `/account`
 * - `/user/[id]/page` to `/user/[id]`
 * - `/account/page` to `/account`
 * - `/page` to `/`
 * - `/(dashboard)/user/[id]/route` to `/user/[id]`
 * - `/(dashboard)/account/route` to `/account`
 * - `/user/[id]/route` to `/user/[id]`
 * - `/account/route` to `/account`
 * - `/route` to `/`
 * - `/` to `/`
 *
 * @param route the app route to normalize
 * @returns the normalized pathname
 */
export declare function normalizeAppPath(route: string): string;
/**
 * Comparator for sorting app paths so that parallel slot paths (containing
 * `/@`) come before the children/root page path. This keeps the direct
 * children/root page last so it can be selected as the canonical entry.
 *
 * Without this, route group prefixes like `(group)` (char code 0x28) sort
 * before `@` (0x40), causing the children page to sort first instead of last
 * and leading to a manifest mismatch / 404 in webpack dev mode.
 */
export declare function compareAppPaths(a: string, b: string): number;
/**
 * Selects the app path that owns the compiled entry for a normalized route.
 * Catch-all normalization can add app paths from other routes, so only direct
 * paths are candidates. Among those, compareAppPaths deterministically prefers
 * the children/root page, or a stable slot when the route only has slots.
 */
export declare function selectAppPageEntry(pathname: string, appPaths: readonly string[], normalizePathname?: (appPath: string) => string): string;
/**
 * Strips the `.rsc` extension if it's in the pathname.
 * Since this function is used on full urls it checks `?` for searchParams handling.
 */
export declare function normalizeRscURL(url: string): string;
