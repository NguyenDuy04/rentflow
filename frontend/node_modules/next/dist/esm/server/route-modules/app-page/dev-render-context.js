import { getRequestMeta } from '../../request-meta';
/** Capture HMR inputs at the App Page handler boundary in dev. */ export function createDevRenderContext(req, hmrCacheFallback) {
    if (!process.env.__NEXT_DEV_SERVER) {
        return undefined;
    }
    const { serverComponentsHmrCache, hmrRefreshHash } = getRequestMeta(req);
    return {
        serverComponentsHmrCache: serverComponentsHmrCache ?? hmrCacheFallback,
        hmrRefreshHash
    };
}

//# sourceMappingURL=dev-render-context.js.map