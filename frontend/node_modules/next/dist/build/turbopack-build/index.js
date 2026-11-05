"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "turbopackBuild", {
    enumerable: true,
    get: function() {
        return turbopackBuild;
    }
});
const _buildcontext = require("../build-context");
const _impl = require("./impl");
function turbopackBuild(telemetry) {
    const nextBuildSpan = _buildcontext.NextBuildContext.nextBuildSpan;
    return nextBuildSpan.traceChild('run-turbopack').traceAsyncFn(()=>(0, _impl.turbopackBuild)(telemetry));
}

//# sourceMappingURL=index.js.map