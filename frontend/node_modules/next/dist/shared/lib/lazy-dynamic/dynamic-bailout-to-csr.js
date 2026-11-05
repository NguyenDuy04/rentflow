'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BailoutToCSRForNextDynamic", {
    enumerable: true,
    get: function() {
        return BailoutToCSRForNextDynamic;
    }
});
const _react = require("react");
const _reactdom = require("react-dom");
const _bailouttocsr = require("./bailout-to-csr");
const _reactbrowserbailout = require("./react-browser-bailout");
const NEXT_DYNAMIC_BAILOUT_REASON = 'next/dynamic';
const getNextDynamicBailoutReason = _reactbrowserbailout.createReactBrowserBailoutReason.bind(null, NEXT_DYNAMIC_BAILOUT_REASON);
function BailoutToCSRForNextDynamic({ children }) {
    if (process.env.__NEXT_EXPERIMENTAL_REACT_BROWSER_BAILOUT) {
        // @ts-expect-error TODO: Update @types/react-dom to include the reason argument.
        (0, _react.use)((0, _reactdom.browser)(getNextDynamicBailoutReason));
        return children;
    }
    if (typeof window === 'undefined') {
        throw new _bailouttocsr.BailoutToCSRError(NEXT_DYNAMIC_BAILOUT_REASON);
    }
    return children;
}

//# sourceMappingURL=dynamic-bailout-to-csr.js.map