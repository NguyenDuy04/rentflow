import './register-deployment-id-global';
import { appBootstrap } from './app-bootstrap';
import { isRecoverableError } from './react-client-callbacks/on-recoverable-error';
window.next.turbopack = true;
self.__webpack_hash__ = '';
// eslint-disable-next-line @next/internal/typechecked-require
const instrumentationModules = require('../lib/require-instrumentation-client');
appBootstrap(()=>{
    const { hydrate } = require('./app-index');
    try {
        hydrate(instrumentationModules);
    } finally{
        if (process.env.__NEXT_DEV_SERVER) {
            const enableCacheIndicator = process.env.__NEXT_CACHE_COMPONENTS;
            const { getOwnerStack } = require('../next-devtools/userspace/app/errors/stitched-error');
            const { renderAppDevOverlay } = require('next/dist/compiled/next-devtools');
            renderAppDevOverlay(getOwnerStack, isRecoverableError, enableCacheIndicator, Boolean(process.env.__NEXT_EXPOSE_RUNTIME_ERRORS_TO_HMR));
        }
    }
});

//# sourceMappingURL=app-next-turbopack.js.map