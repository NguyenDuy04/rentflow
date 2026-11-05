import type { MissingCanonicalInterceptionRoute } from '../router/utils/interception-routes';
export declare class MissingCanonicalInterceptionRoutesError extends Error {
    constructor(routes: readonly MissingCanonicalInterceptionRoute[]);
}
