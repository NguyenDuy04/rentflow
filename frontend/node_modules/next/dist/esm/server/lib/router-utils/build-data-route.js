import path from '../../../shared/lib/isomorphic/path';
import { normalizePagePath } from '../../../shared/lib/page-path/normalize-page-path';
import { isDynamicRoute } from '../../../shared/lib/router/utils/is-dynamic';
import { getNamedRouteRegex } from '../../../shared/lib/router/utils/route-regex';
import { normalizeRouteRegex } from '../../../lib/load-custom-routes';
import { escapeStringRegexp } from '../../../shared/lib/escape-regexp';
export function buildDataRoute(page, buildId) {
    const pagePath = normalizePagePath(page);
    const dataRoute = path.posix.join('/_next/data', buildId, `${pagePath}.json`);
    let dataRouteRegex;
    let namedDataRouteRegex;
    let routeKeys;
    if (isDynamicRoute(page)) {
        const routeRegex = getNamedRouteRegex(dataRoute, {
            prefixRouteKeys: true,
            includeSuffix: true,
            excludeOptionalTrailingSlash: true
        });
        dataRouteRegex = normalizeRouteRegex(routeRegex.re.source);
        namedDataRouteRegex = routeRegex.namedRegex;
        routeKeys = routeRegex.routeKeys;
    } else {
        dataRouteRegex = normalizeRouteRegex(new RegExp(`^${path.posix.join('/_next/data', escapeStringRegexp(buildId), `${pagePath}\\.json`)}$`).source);
    }
    return {
        page,
        routeKeys,
        dataRouteRegex,
        namedDataRouteRegex
    };
}
export function addLocalePrefixToDataRouteRegex(dataRouteRegex, buildId) {
    // dataRouteRegex escapes static segments, including custom build IDs. Locate
    // the escaped build ID so locale insertion also works for IDs such as "a.b".
    const buildIdSegment = `/${escapeStringRegexp(buildId)}`;
    const buildIdIndex = dataRouteRegex.indexOf(buildIdSegment);
    if (buildIdIndex === -1) {
        return dataRouteRegex;
    }
    const insertIndex = buildIdIndex + buildIdSegment.length;
    return `${dataRouteRegex.slice(0, insertIndex)}/(?:[^/]+?)${dataRouteRegex.slice(insertIndex)}`;
}

//# sourceMappingURL=build-data-route.js.map