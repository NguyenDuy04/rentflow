import { getOrCreateGlobalAsyncLocalStorage } from '../../app-render/async-local-storage';
// This storage covers the part of BaseServer request handling that runs before
// App Render creates workAsyncStorage. Once available, workStore remains the
// primary identity source for locally recorded spans.
function getRequestInsightsIdentityStorage() {
    return getOrCreateGlobalAsyncLocalStorage('request-insights-identity-storage');
}
export function runWithRequestInsightsIdentity(identity, fn) {
    return getRequestInsightsIdentityStorage().run(identity, fn);
}
export function getRequestInsightsIdentity() {
    return getRequestInsightsIdentityStorage().getStore();
}

//# sourceMappingURL=request-insights-identity.js.map