export declare function buildDataRoute(page: string, buildId: string): {
    page: string;
    routeKeys: {
        [named: string]: string;
    } | undefined;
    dataRouteRegex: string;
    namedDataRouteRegex: string | undefined;
};
export declare function addLocalePrefixToDataRouteRegex(dataRouteRegex: string, buildId: string): string;
