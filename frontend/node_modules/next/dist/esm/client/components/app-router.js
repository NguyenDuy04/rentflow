import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useInsertionEffect, useDeferredValue } from 'react';
import { AppRouterContext, LayoutRouterContext, GlobalLayoutRouterContext } from '../../shared/lib/app-router-context.shared-runtime';
import { createHrefFromUrl } from './router-reducer/create-href-from-url';
import { createHeadKey } from './router-reducer/create-segment-key';
import { SearchParamsContext, PathnameContext, PathParamsContext, NavigationPromisesContext } from '../../shared/lib/hooks-client-context.shared-runtime';
import { useActionQueue } from './use-action-queue';
import { setLastCommittedTree } from './router-reducer/reducers/committed-state';
import { AppRouterAnnouncer } from './app-router-announcer';
import { RedirectBoundary } from './redirect-boundary';
import { unresolvedThenable } from './unresolved-thenable';
import { removeBasePath } from '../remove-base-path';
import { hasBasePath } from '../has-base-path';
import { extractSourcePageFromFlightRouterState, getSelectedParams } from './router-reducer/compute-changed-path';
import { useNavFailureHandler } from './nav-failure-handler';
import { publicAppRouterInstance } from './app-router-instance';
import { restore, traverse } from './navigator';
import { getRedirectTypeFromError, getURLFromRedirectError } from './redirect';
import { isRedirectError } from './redirect-error';
import { pingVisibleLinks } from './links';
import RootErrorBoundary from './errors/root-error-boundary';
import DefaultGlobalError from './builtin/global-error';
import { RootLayoutBoundary } from '../../lib/framework/boundary-components';
import { getAssetTokenQuery } from '../../shared/lib/deployment-id';
const globalMutable = {};
// A Back/Forward press before the router's popstate listener exists moves the
// browser to a different history entry than the one the document was activated
// on, and the resulting popstate fires with nobody listening. The activation
// entry is fixed for the document's lifetime and entry keys are stable across
// replaceState, so until the listener is installed a key mismatch means a
// traversal went unobserved.
function hasMissedTraversal() {
    if (typeof window.navigation === 'undefined') {
        return false;
    }
    const activationEntry = window.navigation.activation?.entry;
    const currentEntry = window.navigation.currentEntry;
    return activationEntry != null && currentEntry != null && activationEntry.key !== currentEntry.key && // Only entries written by the app router can be restored; on any other
    // entry the traversal is left unhandled, as before.
    window.history.state?.__NA === true;
}
let checkedMissedTraversalBeforeHistoryWrite = false;
let checkedMissedTraversalBeforeReplay = false;
/**
 * Handles a popstate event (or one that was missed before hydration).
 * By default dispatches ACTION_RESTORE, however if the history entry was not
 * pushed/replaced by app-router it will reload the page.
 * That case can happen when the old router injected the history entry.
 */ function handlePopState(state) {
    if (!state) {
        // TODO-APP: this case only happens when pushState/replaceState was called outside of Next.js. It should probably reload the page in this case.
        return;
    }
    // This case happens when the history entry was pushed by the `pages` router.
    if (!state.__NA) {
        window.location.reload();
        return;
    }
    traverse(window.location.href, state.__PRIVATE_NEXTJS_INTERNALS_TREE);
}
function HistoryUpdater({ appRouterState }) {
    useInsertionEffect(()=>{
        if (process.env.__NEXT_APP_NAV_FAIL_HANDLING) {
            // clear pending URL as navigation is no longer
            // in flight
            window.next.__pendingUrl = undefined;
        }
        const { tree, pushRef, canonicalUrl, renderedSearch } = appRouterState;
        if (!checkedMissedTraversalBeforeHistoryWrite) {
            checkedMissedTraversalBeforeHistoryWrite = true;
            if (hasMissedTraversal()) {
                // Skip the write: it would overwrite the traversed-to entry's state.
                // The tree was rendered even though the history write is skipped.
                setLastCommittedTree(tree);
                return;
            }
        }
        const appHistoryState = {
            tree,
            renderedSearch
        };
        // TODO: Use Navigation API if available
        const historyState = {
            ...pushRef.preserveCustomHistoryState ? window.history.state : {},
            // Identifier is shortened intentionally.
            // __NA is used to identify if the history entry can be handled by the app-router.
            // __N is used to identify if the history entry can be handled by the old router.
            __NA: true,
            __PRIVATE_NEXTJS_INTERNALS_TREE: appHistoryState
        };
        if (pushRef.pendingPush && // Skip pushing an additional history entry if the canonicalUrl is the same as the current url.
        // This mirrors the browser behavior for normal navigation.
        createHrefFromUrl(new URL(window.location.href)) !== canonicalUrl) {
            // This intentionally mutates React state, pushRef is overwritten to ensure additional push/replace calls do not trigger an additional history entry.
            pushRef.pendingPush = false;
            window.history.pushState(historyState, '', canonicalUrl);
        } else {
            window.history.replaceState(historyState, '', canonicalUrl);
        }
        setLastCommittedTree(tree);
    }, [
        appRouterState
    ]);
    useEffect(()=>{
        // The Next-Url and the base tree may affect the result of a prefetch
        // task. Re-prefetch all visible links with the updated values. In most
        // cases, this will not result in any new network requests, only if
        // the prefetch result actually varies on one of these inputs.
        pingVisibleLinks(appRouterState.nextUrl, appRouterState.root);
    }, [
        appRouterState.nextUrl,
        appRouterState.root
    ]);
    return null;
}
function copyNextJsInternalHistoryState(data) {
    if (data == null) data = {};
    const currentState = window.history.state;
    const __NA = currentState?.__NA;
    if (__NA) {
        data.__NA = __NA;
    }
    const __PRIVATE_NEXTJS_INTERNALS_TREE = currentState?.__PRIVATE_NEXTJS_INTERNALS_TREE;
    if (__PRIVATE_NEXTJS_INTERNALS_TREE) {
        data.__PRIVATE_NEXTJS_INTERNALS_TREE = __PRIVATE_NEXTJS_INTERNALS_TREE;
    }
    return data;
}
function Head({ headRenderTree }) {
    // If the head has a `prefetchRsc`, it's the statically prefetched data. We
    // should use that on initial render instead of `rsc`. Then we'll switch to
    // `rsc` when the dynamic response streams in.
    const head = headRenderTree.data.rsc;
    const prefetchHead = headRenderTree.data.prefetchRsc;
    // If no prefetch data is available, then we go straight to rendering `head`.
    const resolvedPrefetchRsc = prefetchHead !== null ? prefetchHead : head;
    // We use `useDeferredValue` to handle switching between the prefetched and
    // final values. The second argument is returned on initial render, then it
    // re-renders with the first argument.
    return useDeferredValue(head, resolvedPrefetchRsc);
}
/**
 * The global router that wraps the application components.
 */ function Router({ actionQueue, globalError, webSocket, staticIndicatorState }) {
    const state = useActionQueue(actionQueue);
    const { canonicalUrl } = state;
    // Add memoized pathname/query for useSearchParams and usePathname.
    const { searchParams, pathname } = useMemo(()=>{
        const url = new URL(canonicalUrl, typeof window === 'undefined' ? 'http://n' : window.location.href);
        return {
            // This is turned into a readonly class in `useSearchParams`
            searchParams: url.searchParams,
            pathname: hasBasePath(url.pathname) ? removeBasePath(url.pathname) : url.pathname
        };
    }, [
        canonicalUrl
    ]);
    if (process.env.NODE_ENV !== 'production') {
        const { root, tree } = state;
        // This hook is in a conditional but that is ok because `process.env.NODE_ENV` never changes
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(()=>{
            // Add `window.nd` for debugging purposes.
            // This is not meant for use in applications as concurrent rendering will affect the cache/tree/router.
            // @ts-ignore this is for debugging
            window.nd = {
                router: publicAppRouterInstance,
                root,
                tree
            };
        }, [
            root,
            tree
        ]);
    }
    useEffect(()=>{
        const sourcePage = extractSourcePageFromFlightRouterState(state.tree);
        if (sourcePage !== undefined) {
            window.next.__internal_src_page = sourcePage;
        } else {
            delete window.next.__internal_src_page;
        }
    }, [
        state.tree
    ]);
    useEffect(()=>{
        // If the app is restored from bfcache, it's possible that
        // pushRef.mpaNavigation is true, which would mean that any re-render of this component
        // would trigger the mpa navigation logic again from the lines below.
        // This will restore the router to the initial state in the event that the app is restored from bfcache.
        function handlePageShow(event) {
            if (!event.persisted || !window.history.state?.__PRIVATE_NEXTJS_INTERNALS_TREE) {
                return;
            }
            // Clear the pendingMpaPath value so that a subsequent MPA navigation to the same URL can be triggered.
            // This is necessary because if the browser restored from bfcache, the pendingMpaPath would still be set to the value
            // of the last MPA navigation.
            globalMutable.pendingMpaPath = undefined;
            restore(new URL(window.location.href), window.history.state.__PRIVATE_NEXTJS_INTERNALS_TREE);
        }
        window.addEventListener('pageshow', handlePageShow);
        return ()=>{
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);
    useEffect(()=>{
        // Ensure that any redirect errors that bubble up outside of the RedirectBoundary
        // are caught and handled by the router.
        function handleUnhandledRedirect(event) {
            const error = 'reason' in event ? event.reason : event.error;
            if (isRedirectError(error)) {
                event.preventDefault();
                const url = getURLFromRedirectError(error);
                const redirectType = getRedirectTypeFromError(error);
                // TODO: This should access the router methods directly, rather than
                // go through the public interface.
                if (redirectType === 'push') {
                    publicAppRouterInstance.push(url, {});
                } else {
                    publicAppRouterInstance.replace(url, {});
                }
            }
        }
        window.addEventListener('error', handleUnhandledRedirect);
        window.addEventListener('unhandledrejection', handleUnhandledRedirect);
        return ()=>{
            window.removeEventListener('error', handleUnhandledRedirect);
            window.removeEventListener('unhandledrejection', handleUnhandledRedirect);
        };
    }, []);
    // When mpaNavigation flag is set do a hard navigation to the new url.
    // Infinitely suspend because we don't actually want to rerender any child
    // components with the new URL and any entangled state updates shouldn't
    // commit either (eg: useTransition isPending should stay true until the page
    // unloads).
    //
    // This is a side effect in render. Don't try this at home, kids. It's
    // probably safe because we know this is a singleton component and it's never
    // in <Offscreen>. At least I hope so. (It will run twice in dev strict mode,
    // but that's... fine?)
    const { pushRef } = state;
    if (pushRef.mpaNavigation) {
        // if there's a re-render, we don't want to trigger another redirect if one is already in flight to the same URL
        if (globalMutable.pendingMpaPath !== canonicalUrl) {
            const location = window.location;
            if (pushRef.pendingPush) {
                location.assign(canonicalUrl);
            } else {
                location.replace(canonicalUrl);
            }
            globalMutable.pendingMpaPath = canonicalUrl;
        }
        // TODO-APP: Should we listen to navigateerror here to catch failed
        // navigations somehow? And should we call window.stop() if a SPA navigation
        // should interrupt an MPA one?
        // NOTE: This is intentionally using `throw` instead of `use` because we're
        // inside an externally mutable condition (pushRef.mpaNavigation), which
        // violates the rules of hooks.
        throw unresolvedThenable;
    }
    useEffect(()=>{
        const originalPushState = window.history.pushState.bind(window.history);
        const originalReplaceState = window.history.replaceState.bind(window.history);
        // Ensure the canonical URL in the Next.js Router is updated when the URL is changed so that `usePathname` and `useSearchParams` hold the pushed values.
        const applyUrlFromHistoryPushReplace = (url)=>{
            const href = window.location.href;
            const appHistoryState = window.history.state?.__PRIVATE_NEXTJS_INTERNALS_TREE;
            restore(new URL(url ?? href, href), appHistoryState);
        };
        /**
     * Patch pushState to ensure external changes to the history are reflected in the Next.js Router.
     * Ensures Next.js internal history state is copied to the new history entry.
     * Ensures usePathname and useSearchParams hold the newly provided url.
     */ window.history.pushState = function pushState(data, _unused, url) {
            // TODO: Warn when Navigation API is available (navigation.navigate() should be used)
            // Avoid a loop when Next.js internals trigger pushState/replaceState
            if (data?.__NA || data?._N) {
                return originalPushState(data, _unused, url);
            }
            data = copyNextJsInternalHistoryState(data);
            if (url) {
                applyUrlFromHistoryPushReplace(url);
            }
            return originalPushState(data, _unused, url);
        };
        /**
     * Patch replaceState to ensure external changes to the history are reflected in the Next.js Router.
     * Ensures Next.js internal history state is copied to the new history entry.
     * Ensures usePathname and useSearchParams hold the newly provided url.
     */ window.history.replaceState = function replaceState(data, _unused, url) {
            // TODO: Warn when Navigation API is available (navigation.navigate() should be used)
            // Avoid a loop when Next.js internals trigger pushState/replaceState
            if (data?.__NA || data?._N) {
                return originalReplaceState(data, _unused, url);
            }
            data = copyNextJsInternalHistoryState(data);
            if (url) {
                applyUrlFromHistoryPushReplace(url);
            }
            return originalReplaceState(data, _unused, url);
        };
        const onPopState = (event)=>handlePopState(event.state);
        window.addEventListener('popstate', onPopState);
        if (!checkedMissedTraversalBeforeReplay) {
            checkedMissedTraversalBeforeReplay = true;
            if (hasMissedTraversal()) {
                handlePopState(window.history.state);
            }
        }
        return ()=>{
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', onPopState);
        };
    }, []);
    const { root, tree, nextUrl, scrollRef, previousNextUrl } = state;
    // Add memoized pathParams for useParams.
    const pathParams = useMemo(()=>{
        return getSelectedParams(tree);
    }, [
        tree
    ]);
    // Create instrumented promises for navigation hooks (dev-only)
    // These are specially instrumented promises to show in the Suspense DevTools
    // Promises are cached outside of render to survive suspense retries.
    let instrumentedNavigationPromises = null;
    if (process.env.NODE_ENV !== 'production') {
        const { createRootNavigationPromises } = require('./navigation-devtools');
        instrumentedNavigationPromises = createRootNavigationPromises(tree, pathname, searchParams, pathParams);
    }
    const layoutRouterContext = useMemo(()=>{
        return {
            parentTree: tree,
            parentRenderTree: root.tree,
            parentSegmentPath: null,
            parentParams: {},
            parentLoadingData: null,
            // This is the <Activity> "name" that shows up in the Suspense DevTools.
            // It represents the root of the app.
            debugNameContext: '/',
            // Root node always has `url`
            // Provided in AppTreeContext to ensure it can be overwritten in layout-router
            url: canonicalUrl,
            // Root segment is always active
            isActive: true
        };
    }, [
        tree,
        root,
        canonicalUrl
    ]);
    const globalLayoutRouterContext = useMemo(()=>{
        return {
            tree,
            scrollRef,
            nextUrl,
            previousNextUrl
        };
    }, [
        tree,
        scrollRef,
        nextUrl,
        previousNextUrl
    ]);
    // The head is wrapped in an extra component so we can use
    // `useDeferredValue` to swap between the prefetched and final versions of
    // the head. (This is what LayoutRouter does for segment data, too.)
    //
    // The `key` is used to remount the component whenever the head moves to a
    // different page, one of its path param values changes (the same inputs as
    // LayoutRouter's keys), or its search params change. These are the entries
    // of the head's vary path (see getHeadRequestKey).
    const head = /*#__PURE__*/ _jsx(Head, {
        headRenderTree: root.head
    }, createHeadKey(root.head.varyPath));
    let content = /*#__PURE__*/ _jsxs(RedirectBoundary, {
        children: [
            head,
            /*#__PURE__*/ _jsx(RootLayoutBoundary, {
                children: root.tree.data.rsc
            }),
            /*#__PURE__*/ _jsx(AppRouterAnnouncer, {
                tree: tree
            })
        ]
    });
    if (process.env.__NEXT_DEV_SERVER) {
        // In development, we apply few error boundaries and hot-reloader:
        // - DevRootHTTPAccessFallbackBoundary: avoid using navigation API like notFound() in root layout
        // - HotReloader:
        //  - hot-reload the app when the code changes
        //  - render dev overlay
        //  - catch runtime errors and display global-error when necessary
        if (typeof window !== 'undefined') {
            const { DevRootHTTPAccessFallbackBoundary } = // TODO(browser-variant): migrate to a .ts/.browser.ts split so the browser bundle drops the server branch; see scripts/generate-browser-variant-aliases.mjs
            // ast-grep-ignore: no-typeof-window-require-tsx
            require('./dev-root-http-access-fallback-boundary');
            content = /*#__PURE__*/ _jsx(DevRootHTTPAccessFallbackBoundary, {
                children: content
            });
        }
        const HotReloader = require('../dev/hot-reloader/app/hot-reloader-app').default;
        content = /*#__PURE__*/ _jsx(HotReloader, {
            globalError: globalError,
            webSocket: webSocket,
            staticIndicatorState: staticIndicatorState,
            children: content
        });
    } else {
        content = /*#__PURE__*/ _jsx(RootErrorBoundary, {
            errorComponent: globalError[0],
            errorStyles: globalError[1],
            children: content
        });
    }
    if (process.env.__NEXT_USE_OFFLINE) {
        const { OfflineProvider } = require('./use-offline');
        content = /*#__PURE__*/ _jsx(OfflineProvider, {
            children: content
        });
    }
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(HistoryUpdater, {
                appRouterState: state
            }),
            process.env.TURBOPACK ? null : /*#__PURE__*/ _jsx(RuntimeStylesForWebpack, {}),
            /*#__PURE__*/ _jsx(NavigationPromisesContext.Provider, {
                value: instrumentedNavigationPromises,
                children: /*#__PURE__*/ _jsx(PathParamsContext.Provider, {
                    value: pathParams,
                    children: /*#__PURE__*/ _jsx(PathnameContext.Provider, {
                        value: pathname,
                        children: /*#__PURE__*/ _jsx(SearchParamsContext.Provider, {
                            value: searchParams,
                            children: /*#__PURE__*/ _jsx(GlobalLayoutRouterContext.Provider, {
                                value: globalLayoutRouterContext,
                                children: /*#__PURE__*/ _jsx(AppRouterContext.Provider, {
                                    value: publicAppRouterInstance,
                                    children: /*#__PURE__*/ _jsx(LayoutRouterContext.Provider, {
                                        value: layoutRouterContext,
                                        children: content
                                    })
                                })
                            })
                        })
                    })
                })
            })
        ]
    });
}
export default function AppRouter({ actionQueue, globalErrorState, webSocket, staticIndicatorState }) {
    useNavFailureHandler();
    const router = /*#__PURE__*/ _jsx(Router, {
        actionQueue: actionQueue,
        globalError: globalErrorState,
        webSocket: webSocket,
        staticIndicatorState: staticIndicatorState
    });
    // At the very top level, use the default GlobalError component as the final fallback.
    // When the app router itself fails, which means the framework itself fails, we show the default error.
    return /*#__PURE__*/ _jsx(RootErrorBoundary, {
        errorComponent: DefaultGlobalError,
        children: router
    });
}
let runtimeStyles;
let runtimeStyleChanged;
if (!process.env.TURBOPACK && typeof window !== 'undefined') {
    runtimeStyles = new Set();
    runtimeStyleChanged = new Set();
    globalThis._N_E_STYLE_LOAD = function(href) {
        if (!runtimeStyles || !runtimeStyleChanged) return Promise.resolve();
        let len = runtimeStyles.size;
        runtimeStyles.add(href);
        if (runtimeStyles.size !== len) {
            runtimeStyleChanged.forEach((cb)=>cb());
        }
        // TODO figure out how to get a promise here
        // But maybe it's not necessary as react would block rendering until it's loaded
        return Promise.resolve();
    };
}
function RuntimeStylesForWebpack() {
    const [, forceUpdate] = React.useState(0);
    const renderedStylesSize = runtimeStyles?.size ?? 0;
    useEffect(()=>{
        if (!runtimeStyles || !runtimeStyleChanged) return;
        const changed = ()=>forceUpdate((c)=>c + 1);
        runtimeStyleChanged.add(changed);
        if (renderedStylesSize !== runtimeStyles.size) {
            changed();
        }
        return ()=>{
            runtimeStyleChanged.delete(changed);
        };
    }, [
        renderedStylesSize,
        forceUpdate
    ]);
    const query = getAssetTokenQuery();
    return [
        ...runtimeStyles || []
    ].map((href, i)=>/*#__PURE__*/ _jsx("link", {
            rel: "stylesheet",
            href: `${href}${query}`,
            // @ts-ignore
            precedence: "next"
        }, i));
}

//# sourceMappingURL=app-router.js.map