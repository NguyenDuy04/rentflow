"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return analyze;
    }
});
const _trace = require("../../trace");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../output/log"));
const _nodepath = /*#__PURE__*/ _interop_require_wildcard(require("node:path"));
const _config = /*#__PURE__*/ _interop_require_default(require("../../server/config"));
const _constants = require("../../shared/lib/constants");
const _turbopackanalyze = require("../turbopack-analyze");
const _durationtostring = require("../duration-to-string");
const _lockfile = require("../lockfile");
const _installbindings = require("../swc/install-bindings");
const _nodefs = require("node:fs");
const _snapshot = require("./snapshot");
const _nodehttp = /*#__PURE__*/ _interop_require_default(require("node:http"));
const _servehandler = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/serve-handler"));
const _storage = require("../../telemetry/storage");
const _events = require("../../telemetry/events");
const _shared = require("../../trace/shared");
const _bundler = require("../../lib/bundler");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function analyze({ dir, reactProductionProfiling = false, noMangling = false, appDirOnly = false, output = false, port = 4000, snapshot }) {
    if (snapshot !== undefined) _snapshot.snapshotNameSchema.parse(snapshot);
    let lockfile;
    try {
        var _config_experimental;
        // analyze is Turbopack-only. Mirror what parseBundlerArgs does for build/dev
        // so every process.env.TURBOPACK consumer in this run agrees with the bundler choice.
        process.env.TURBOPACK ??= '1';
        const config = await (0, _config.default)(_constants.PHASE_ANALYZE, dir, {
            silent: false,
            reactProductionProfiling,
            bundler: _bundler.Bundler.Turbopack
        });
        process.env.NEXT_DEPLOYMENT_ID = config.deploymentId || '';
        const distDir = _nodepath.join(dir, config.distDir);
        const telemetry = new _storage.Telemetry({
            distDir
        });
        (0, _trace.setGlobal)('phase', _constants.PHASE_ANALYZE);
        (0, _trace.setGlobal)('distDir', distDir);
        (0, _trace.setGlobal)('telemetry', telemetry);
        // Native locks require synchronous access to bindings. Like next build,
        // install them before acquiring the lock, but still lock before writes.
        await (0, _installbindings.installBindings)((_config_experimental = config.experimental) == null ? void 0 : _config_experimental.useWasmBinary);
        // Lock the directory while capture reads/writes it. Static serving and
        // saved-data replay do not need to hold the capture lock.
        if (config.experimental.lockDistDir) {
            (0, _nodefs.mkdirSync)(distDir, {
                recursive: true
            });
            lockfile = await _lockfile.Lockfile.acquireWithRetriesOrExit(_nodepath.join(distDir, 'lock'), 'next analyze');
        }
        _log.info('Analyzing a production build...');
        const analyzeContext = {
            config,
            dir,
            distDir,
            noMangling,
            appDirOnly
        };
        // Start a fresh live dataset so removed routes cannot leak into a replacement.
        (0, _nodefs.rmSync)(_nodepath.join(distDir, 'diagnostics/analyze/data'), {
            recursive: true,
            force: true,
            maxRetries: 3
        });
        const { duration: analyzeDuration, shutdownPromise } = await (0, _turbopackanalyze.turbopackAnalyze)(analyzeContext);
        const durationString = (0, _durationtostring.durationToString)(analyzeDuration);
        const analyzeDir = _nodepath.join(distDir, 'diagnostics/analyze');
        await shutdownPromise;
        (0, _nodefs.cpSync)(_nodepath.join(__dirname, '../../bundle-analyzer'), analyzeDir, {
            recursive: true
        });
        (0, _nodefs.mkdirSync)(_nodepath.join(analyzeDir, 'data'), {
            recursive: true
        });
        const routes = (0, _snapshot.readAnalyzeRoutes)(_nodepath.join(analyzeDir, 'data'));
        // Capture this build alongside any prior builds so the analyzer UI can
        // offer it as a comparison baseline in the future.
        const metadata = (0, _snapshot.writeAnalyzeSnapshot)({
            projectDir: dir,
            analyzeDir,
            routes,
            appDirOnly,
            noMangling,
            snapshot
        });
        let logMessage = `Analyze completed in ${durationString}.`;
        if (output) {
            logMessage += ` Results written to ${analyzeDir}.\nTo explore the analyze results interactively, run \`next analyze\` without \`--output\`.`;
        }
        _log.event(logMessage);
        telemetry.record((0, _events.eventAnalyzeCompleted)({
            success: true,
            durationInSeconds: Math.round(analyzeDuration),
            totalPageCount: routes.length
        }));
        if (!output) {
            await startServer(analyzeDir, port);
        }
        return metadata;
    } catch (e) {
        const telemetry = _shared.traceGlobals.get('telemetry');
        if (telemetry) {
            telemetry.record((0, _events.eventAnalyzeCompleted)({
                success: false
            }));
        }
        throw e;
    } finally{
        await (lockfile == null ? void 0 : lockfile.unlock());
    }
}
function startServer(dir, port) {
    const server = _nodehttp.default.createServer((req, res)=>{
        return (0, _servehandler.default)(req, res, {
            public: dir
        });
    });
    return new Promise((resolve, reject)=>{
        function onError(err) {
            server.close(()=>{
                reject(err);
            });
        }
        server.on('error', onError);
        server.listen(port, 'localhost', ()=>{
            const address = server.address();
            if (address == null) {
                reject(new Error('Unable to get server address'));
                return;
            }
            // No longer needed after startup
            server.removeListener('error', onError);
            let addressString;
            if (typeof address === 'string') {
                addressString = address;
            } else if (address.family === 'IPv6' && (address.address === '::' || address.address === '::1')) {
                addressString = `localhost:${address.port}`;
            } else if (address.family === 'IPv6') {
                addressString = `[${address.address}]:${address.port}`;
            } else {
                addressString = `${address.address}:${address.port}`;
            }
            _log.info(`Bundle analyzer available at http://${addressString}`);
            resolve();
        });
    });
}

//# sourceMappingURL=index.js.map