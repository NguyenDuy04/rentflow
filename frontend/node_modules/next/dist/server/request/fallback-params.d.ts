import type { FallbackRouteParam } from '../../build/static-paths/types';
import type AppPageRouteModule from '../route-modules/app-page/module';
/**
 * Maps unknown param names to internal placeholders. The parameter wrappers
 * control when reads suspend; these placeholders must not become rendered UI.
 */
export type OpaqueFallbackRouteParams = ReadonlyMap<string, string>;
/**
 * Creates an opaque fallback route params object from the fallback route params.
 *
 * @param fallbackRouteParams the fallback route params
 * @returns the opaque fallback route params
 */
export declare function createOpaqueFallbackRouteParams(fallbackRouteParams: readonly FallbackRouteParam[]): OpaqueFallbackRouteParams | null;
/**
 * Selects the params that a staged render defers for the shell target that a
 * request selects. Dev static-shell validation stages the same set, so it
 * checks the shell that the build validates.
 *
 * The set derives from the build's shell metadata, not from the serving mode. A
 * required shell (`throwOnEmptyStaticShell`) is the most specific shell the
 * build generated for its params, and the build fails when its prelude is
 * empty. Staging defers all of its fallback params, because the build validated
 * exactly that shape. Any other shell may be empty, and a request completes it
 * with the params that `generateStaticParams` can still supply. Only the params
 * that completion never resolves stay deferred.
 */
export declare function getStagedFallbackParams(route: {
    fallbackRouteParams: readonly FallbackRouteParam[] | undefined;
    remainingPrerenderableParams?: readonly FallbackRouteParam[];
    throwOnEmptyStaticShell?: boolean;
}): OpaqueFallbackRouteParams | null;
export declare function buildDynamicSegmentPlaceholder(param: Pick<FallbackRouteParam, 'paramName' | 'paramType'>): string;
export declare function getPlaceholderFallbackRouteParams(params: Record<string, undefined | string | string[]> | undefined, fallbackRouteParams: readonly FallbackRouteParam[]): FallbackRouteParam[];
/**
 * Gets the fallback route params for a given page. This is an expensive
 * operation because it requires parsing the loader tree to extract the fallback
 * route params.
 *
 * @param page the page
 * @param routeModule the route module
 * @returns the opaque fallback route params
 */
export declare function getFallbackRouteParams(page: string, routeModule: AppPageRouteModule): OpaqueFallbackRouteParams | null;
