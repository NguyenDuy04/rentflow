export type IncompatibleParallelRouteSlots = {
    layoutFile: string;
    route: string;
    missingSlots: readonly string[];
};
export declare class IncompatibleParallelRouteSlotsError extends Error {
    constructor(routes: readonly IncompatibleParallelRouteSlots[]);
}
