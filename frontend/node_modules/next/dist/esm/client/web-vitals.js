import { useEffect } from 'react';
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'next/dist/compiled/web-vitals';
export function useReportWebVitals(reportWebVitalsFn) {
    useEffect(()=>{
        onCLS(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        onLCP(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        onINP(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        onFCP(reportWebVitalsFn, {
            reportSoftNavs: true
        });
        onTTFB(reportWebVitalsFn);
    }, [
        reportWebVitalsFn
    ]);
}

//# sourceMappingURL=web-vitals.js.map