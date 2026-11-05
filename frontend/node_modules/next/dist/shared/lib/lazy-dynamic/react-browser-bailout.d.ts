type ReactBrowserBailoutReason = {
    $$typeof: symbol;
    reason: string;
};
export declare function createReactBrowserBailoutReason(reason: string): ReactBrowserBailoutReason;
export declare function getReactBrowserBailoutReason(error: unknown): string | undefined;
export declare function isNextBrowserBailoutError(error: unknown): boolean;
export {};
