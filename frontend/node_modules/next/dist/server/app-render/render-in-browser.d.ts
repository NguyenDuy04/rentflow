/**
 * Aborting a resumed render with a recoverable reason tells React to leave the
 * postponed boundary for the browser instead of reporting a render error.
 */
export declare function createRenderInBrowserAbortSignal(reactBrowserBailout: boolean): AbortSignal;
