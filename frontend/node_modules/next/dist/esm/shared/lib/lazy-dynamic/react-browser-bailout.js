// This module is bundled separately into user code and the precompiled App
// Router runtime. Use the global symbol registry so both copies recognize the
// same browser bailout reason.
const REACT_BROWSER_BAILOUT_REASON = Symbol.for('next.browser-bailout-reason');
export function createReactBrowserBailoutReason(reason) {
    return {
        $$typeof: REACT_BROWSER_BAILOUT_REASON,
        reason
    };
}
export function getReactBrowserBailoutReason(error) {
    const cause = error?.cause;
    return cause?.$$typeof === REACT_BROWSER_BAILOUT_REASON ? cause.reason : undefined;
}
export function isNextBrowserBailoutError(error) {
    return getReactBrowserBailoutReason(error) !== undefined;
}

//# sourceMappingURL=react-browser-bailout.js.map