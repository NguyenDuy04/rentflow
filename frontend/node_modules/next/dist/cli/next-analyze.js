#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    nextAnalyze: null,
    nextAnalyzeExport: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    nextAnalyze: function() {
        return nextAnalyze;
    },
    nextAnalyzeExport: function() {
        return nextAnalyzeExport;
    }
});
const _cpuprofile = require("../server/lib/cpu-profile");
const _nodefs = require("node:fs");
const _nodepath = require("node:path");
const _picocolors = require("../lib/picocolors");
const _analyze = /*#__PURE__*/ _interop_require_default(require("../build/analyze"));
const _log = require("../build/output/log");
const _utils = require("../server/lib/utils");
const _getprojectdir = require("../lib/get-project-dir");
const _warnmissingreactdependencies = require("../lib/warn-missing-react-dependencies");
const _graphdump = require("../build/analyze/graph-dump");
const _snapshot = require("../build/analyze/snapshot");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function nextAnalyzeExport(options, directory) {
    var _snapshots_;
    // Replay does not load next.config, acquire the capture lock, or write artifacts.
    const analyzeDir = (0, _nodepath.join)((0, _nodepath.resolve)(directory ?? '.', options.distDir ?? '.next'), 'diagnostics/analyze');
    const { snapshots } = _snapshot.historyIndexSchema.parse(JSON.parse((0, _nodefs.readFileSync)((0, _nodepath.join)(analyzeDir, 'history/history.json'), 'utf8')));
    const name = options.snapshot === undefined ? (_snapshots_ = snapshots[0]) == null ? void 0 : _snapshots_.name : _snapshot.snapshotNameSchema.parse(options.snapshot);
    if (name === undefined || !snapshots.some((snapshot)=>snapshot.name === name)) {
        throw new Error(`Analyzer snapshot not found: ${name ?? '(none)'}`);
    }
    (0, _graphdump.dumpAnalyzeGraph)((0, _nodepath.join)(analyzeDir, 'history', (0, _snapshot.snapshotDirectory)(name)), name, options.route);
}
const nextAnalyze = async (options, directory)=>{
    process.on('SIGTERM', ()=>{
        (0, _cpuprofile.saveCpuProfile)();
        process.exit(143);
    });
    process.on('SIGINT', ()=>{
        (0, _cpuprofile.saveCpuProfile)();
        process.exit(130);
    });
    const { profile, mangling, experimentalAppOnly, output, port, snapshot } = options;
    if (snapshot !== undefined) _snapshot.snapshotNameSchema.parse(snapshot);
    if (!mangling) {
        (0, _log.warn)(`Mangling is disabled. ${(0, _picocolors.italic)('Note: This may affect performance and should only be used for debugging purposes.')}`);
    }
    if (profile) {
        (0, _log.warn)(`Profiling is enabled. ${(0, _picocolors.italic)('Note: This may affect performance.')}`);
    }
    const dir = (0, _getprojectdir.getProjectDir)(directory);
    (0, _warnmissingreactdependencies.warnMissingReactDependencies)(dir);
    if (!(0, _nodefs.existsSync)(dir)) {
        (0, _utils.printAndExit)(`> No such directory exists as the project root: ${dir}`);
    }
    await (0, _analyze.default)({
        dir,
        reactProductionProfiling: profile,
        noMangling: !mangling,
        appDirOnly: experimentalAppOnly,
        output,
        port,
        snapshot
    });
};

//# sourceMappingURL=next-analyze.js.map