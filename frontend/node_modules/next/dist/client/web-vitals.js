"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useReportWebVitals", {
    enumerable: true,
    get: function() {
        return useReportWebVitals;
    }
});
const _react = require("react");
const _webvitals = require("next/dist/compiled/web-vitals");
function useReportWebVitals(reportWebVitalsFn) {
    (0, _react.useEffect)(()=>{
        (0, _webvitals.onCLS)(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        (0, _webvitals.onLCP)(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        (0, _webvitals.onINP)(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        (0, _webvitals.onFCP)(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        (0, _webvitals.onTTFB)(reportWebVitalsFn);
    }, [
        reportWebVitalsFn
    ]);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=web-vitals.js.map