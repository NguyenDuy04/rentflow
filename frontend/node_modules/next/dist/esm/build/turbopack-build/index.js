import { NextBuildContext } from '../build-context';
import { turbopackBuild as turbopackBuildImpl } from './impl';
export function turbopackBuild(telemetry) {
    const nextBuildSpan = NextBuildContext.nextBuildSpan;
    return nextBuildSpan.traceChild('run-turbopack').traceAsyncFn(()=>turbopackBuildImpl(telemetry));
}

//# sourceMappingURL=index.js.map