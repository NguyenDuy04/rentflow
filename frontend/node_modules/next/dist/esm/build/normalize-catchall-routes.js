import { findIncompatibleParallelRouteSlots, normalizeCatchAllRoutes as normalizeCatchAllRoutesInternal } from '../server/lib/router-utils/normalize-catchall-routes';
export { findIncompatibleParallelRouteSlots };
export function normalizeCatchAllRoutes(appPaths, options = {}) {
    return normalizeCatchAllRoutesInternal(appPaths, undefined, options);
}

//# sourceMappingURL=normalize-catchall-routes.js.map