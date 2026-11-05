import { workUnitAsyncStorage } from './server-async-storage';
// if we are revalidating we want to re-throw the error so the
// function crashes so we can maintain our previous cache
// instead of caching the error page
export function handleISRError({ error }) {
    if (!workUnitAsyncStorage) {
        return;
    }
    const store = workUnitAsyncStorage.getStore();
    switch(store?.type){
        case 'prerender':
        case 'prerender-client':
        case 'prerender-legacy':
            if (error) {
                console.error(error);
            }
            throw error;
        case 'request':
        case 'prerender-runtime':
        case 'validation-client':
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
        case 'build-time-generator':
        case undefined:
            return;
        default:
            store;
    }
}

//# sourceMappingURL=handle-isr-error.js.map