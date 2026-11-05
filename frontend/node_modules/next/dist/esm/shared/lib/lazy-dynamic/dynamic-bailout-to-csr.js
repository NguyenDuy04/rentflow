'use client';
import { use } from 'react';
import { browser } from 'react-dom';
import { BailoutToCSRError } from './bailout-to-csr';
import { createReactBrowserBailoutReason } from './react-browser-bailout';
const NEXT_DYNAMIC_BAILOUT_REASON = 'next/dynamic';
const getNextDynamicBailoutReason = createReactBrowserBailoutReason.bind(null, NEXT_DYNAMIC_BAILOUT_REASON);
/**
 * Signals during server rendering that this subtree should be client-rendered.
 */ export function BailoutToCSRForNextDynamic({ children }) {
    if (process.env.__NEXT_EXPERIMENTAL_REACT_BROWSER_BAILOUT) {
        // @ts-expect-error TODO: Update @types/react-dom to include the reason argument.
        use(browser(getNextDynamicBailoutReason));
        return children;
    }
    if (typeof window === 'undefined') {
        throw new BailoutToCSRError(NEXT_DYNAMIC_BAILOUT_REASON);
    }
    return children;
}

//# sourceMappingURL=dynamic-bailout-to-csr.js.map