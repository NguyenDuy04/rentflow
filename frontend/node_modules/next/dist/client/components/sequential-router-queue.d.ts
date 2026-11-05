import { type AppHistoryState, type NavigateAction, ScrollBehavior } from './router-reducer/router-reducer-types';
import type { NavigateOptions } from '../../shared/lib/app-router-context.shared-runtime';
import { type LinkInstance } from './links';
import type { RouterTransitionPrefetchIntent } from '../router-transition-types';
export declare function navigate(href: string, navigateType: NavigateAction['navigateType'], scrollBehavior: ScrollBehavior, linkInstanceRef: LinkInstance | null, transitionTypes: string[] | undefined, prefetchIntent: RouterTransitionPrefetchIntent | null): void;
export declare function push(href: string, options?: NavigateOptions): void;
export declare function replace(href: string, options?: NavigateOptions): void;
export declare function traverse(href: string, historyState: AppHistoryState | undefined): void;
/**
 * Sync the router state to a history entry that was written by something
 * other than a router navigation (a userland pushState/replaceState, or a
 * bfcache restore). Unlike a traversal, this does not represent a transition
 * between routes.
 */
export declare function restore(url: URL, historyState: AppHistoryState | undefined): void;
export declare function refresh(): void;
export declare function hmrRefresh(): void;
