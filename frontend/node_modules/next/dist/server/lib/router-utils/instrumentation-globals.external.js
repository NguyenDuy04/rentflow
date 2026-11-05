"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ensureInstrumentationRegistered: null,
    ensureInstrumentationRegisteredWithDeferredSpans: null,
    getInstrumentationModule: null,
    instrumentationOnRequestError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ensureInstrumentationRegistered: function() {
        return ensureInstrumentationRegistered;
    },
    ensureInstrumentationRegisteredWithDeferredSpans: function() {
        return ensureInstrumentationRegisteredWithDeferredSpans;
    },
    getInstrumentationModule: function() {
        return getInstrumentationModule;
    },
    instrumentationOnRequestError: function() {
        return instrumentationOnRequestError;
    }
});
const _nodepath = /*#__PURE__*/ _interop_require_default(require("node:path"));
const _iserror = /*#__PURE__*/ _interop_require_default(require("../../../lib/is-error"));
const _constants = require("../../../lib/constants");
const _interopdefault = require("../../../lib/interop-default");
const _instrumentationnodeextensions = require("./instrumentation-node-extensions");
const _tracer = require("../trace/tracer");
const _constants1 = require("../trace/constants");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let cachedInstrumentationModule;
let instrumentationModuleLoadTiming;
function getInstrumentationTimestamp() {
    // Date.now() is treated as synchronous I/O while Cache Components render.
    return performance.timeOrigin + performance.now();
}
function traceBackdatedInstrumentationSpan({ type, spanName, timing: { startTime, endTime, error } }) {
    (0, _tracer.getTracer)().trace(type, {
        spanName,
        startTime,
        endTime
    }, error === undefined ? ()=>undefined : (span)=>{
        span == null ? void 0 : span.recordException(error);
        if ((0, _iserror.default)(error)) {
            span == null ? void 0 : span.setAttribute('error.type', error.name);
        }
        span == null ? void 0 : span.setStatus({
            code: _tracer.SpanStatusCode.ERROR,
            message: (0, _iserror.default)(error) ? error.message : undefined
        });
    });
}
/**
 * Takes the recorded timing of loading the instrumentation module, if not
 * emitted yet, as a lifecycle span.
 */ function takeInstrumentationModuleLoadSpan() {
    if (!instrumentationModuleLoadTiming) return undefined;
    const timing = instrumentationModuleLoadTiming;
    instrumentationModuleLoadTiming = undefined;
    return {
        type: _constants1.InstrumentationSpan.loadModule,
        spanName: 'load instrumentation module',
        timing
    };
}
function traceInstrumentationModuleLoad() {
    const span = takeInstrumentationModuleLoadSpan();
    if (span) {
        traceBackdatedInstrumentationSpan(span);
    }
}
async function getInstrumentationModule(projectDir, distDir) {
    if (cachedInstrumentationModule) {
        return cachedInstrumentationModule;
    }
    const startTime = getInstrumentationTimestamp();
    let error;
    try {
        cachedInstrumentationModule = (0, _interopdefault.interopDefault)(await require(_nodepath.default.join(projectDir, distDir, 'server', `${_constants.INSTRUMENTATION_HOOK_FILENAME}.js`)));
        return cachedInstrumentationModule;
    } catch (err) {
        if ((0, _iserror.default)(err) && err.code !== 'ENOENT' && err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ERR_MODULE_NOT_FOUND') {
            error = err;
            throw err;
        }
    } finally{
        instrumentationModuleLoadTiming ??= {
            startTime,
            endTime: getInstrumentationTimestamp(),
            error
        };
    }
}
let instrumentationModulePromise = null;
/**
 * Loads `instrumentation.ts` and calls its `register()`.
 *
 * Its lifecycle spans (`load instrumentation module`, `register
 * instrumentation`) are backdated and emitted afterwards, since `register()`
 * commonly installs the tracer provider. They are emitted right away in the
 * active context, unless `deferredSpans` is given: then successfully completed
 * steps are added to it instead, for the caller to emit in another context
 * (the request that triggered registration). Failed steps are always emitted
 * right away.
 */ async function registerInstrumentation(projectDir, distDir, deferredSpans) {
    // Ensure registerInstrumentation is not called in production build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return;
    }
    if (!instrumentationModulePromise) {
        instrumentationModulePromise = getInstrumentationModule(projectDir, distDir);
    }
    let instrumentation;
    try {
        instrumentation = await instrumentationModulePromise;
    } catch (err) {
        // A load error is only exportable when a provider was already installed.
        traceInstrumentationModuleLoad();
        throw err;
    }
    if (instrumentation == null ? void 0 : instrumentation.register) {
        const startTime = getInstrumentationTimestamp();
        let error;
        let registered = false;
        try {
            await instrumentation.register();
            (0, _instrumentationnodeextensions.afterRegistration)();
            registered = true;
        } catch (err) {
            error = err;
            err.message = `An error occurred while loading instrumentation hook: ${err.message}`;
            throw err;
        } finally{
            const endTime = getInstrumentationTimestamp();
            // register() commonly installs the provider, so emit both lifecycle
            // spans afterward with their original timestamps.
            const spans = [
                takeInstrumentationModuleLoadSpan(),
                {
                    type: _constants1.InstrumentationSpan.register,
                    spanName: 'register instrumentation',
                    timing: {
                        startTime,
                        endTime,
                        error
                    }
                }
            ].filter((span)=>span !== undefined);
            // Only defer after a successful registration: a failing request has no
            // request span to emit them in.
            if (deferredSpans && registered) {
                deferredSpans.push(...spans);
            } else {
                spans.forEach(traceBackdatedInstrumentationSpan);
            }
        }
    } else {
        const span = takeInstrumentationModuleLoadSpan();
        if (span) {
            if (deferredSpans) {
                deferredSpans.push(span);
            } else {
                traceBackdatedInstrumentationSpan(span);
            }
        }
    }
}
async function instrumentationOnRequestError(projectDir, distDir, ...args) {
    const instrumentation = await getInstrumentationModule(projectDir, distDir);
    try {
        var _instrumentation_onRequestError;
        await (instrumentation == null ? void 0 : (_instrumentation_onRequestError = instrumentation.onRequestError) == null ? void 0 : _instrumentation_onRequestError.call(instrumentation, ...args));
    } catch (err) {
        // Log the soft error and continue, since the original error has already been thrown
        console.error('Error in instrumentation.onRequestError:', err);
    }
}
let registerInstrumentationPromise = null;
function ensureInstrumentationRegistered(projectDir, distDir) {
    if (!registerInstrumentationPromise) {
        registerInstrumentationPromise = registerInstrumentation(projectDir, distDir);
    }
    return registerInstrumentationPromise;
}
async function ensureInstrumentationRegisteredWithDeferredSpans(projectDir, distDir) {
    if (registerInstrumentationPromise) {
        await registerInstrumentationPromise;
        return undefined;
    }
    const deferredSpans = [];
    registerInstrumentationPromise = registerInstrumentation(projectDir, distDir, deferredSpans);
    await registerInstrumentationPromise;
    if (deferredSpans.length === 0) {
        return undefined;
    }
    return ()=>{
        // Emit at most once.
        deferredSpans.splice(0).forEach(traceBackdatedInstrumentationSpan);
    };
}

//# sourceMappingURL=instrumentation-globals.external.js.map