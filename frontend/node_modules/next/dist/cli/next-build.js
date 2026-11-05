#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    nextBuild: null,
    saveCpuProfile: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    nextBuild: function() {
        return nextBuild;
    },
    saveCpuProfile: function() {
        return _cpuprofile.saveCpuProfile;
    }
});
const _cpuprofile = require("../server/lib/cpu-profile");
const _fs = require("fs");
const _picocolors = require("../lib/picocolors");
const _build = /*#__PURE__*/ _interop_require_default(require("../build"));
const _log = require("../build/output/log");
const _utils = require("../server/lib/utils");
const _iserror = /*#__PURE__*/ _interop_require_default(require("../lib/is-error"));
const _getprojectdir = require("../lib/get-project-dir");
const _warnmissingreactdependencies = require("../lib/warn-missing-react-dependencies");
const _startup = require("../lib/memory/startup");
const _shutdown = require("../lib/memory/shutdown");
const _bundler = require("../lib/bundler");
const _resolvebuildpaths = require("../lib/resolve-build-paths");
const _promptoutput = require("../lib/upgrade/prompt-output");
const _child_process = require("child_process");
const _events = require("events");
const _os = /*#__PURE__*/ _interop_require_default(require("os"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const nextBuild = async (options, directory)=>{
    process.title = `next-build (v${"16.4.5"})`;
    // To show the upgrade menu without pausing the build, run the build in a
    // child and keep the menu here.
    if (process.env.NEXT_PRIVATE_UPGRADE_BUILD_CHILD === '1') {
        (0, _utils.blockOnOutputWrites)();
    } else if (await shouldBuildInChild()) {
        return buildInChild();
    }
    const onTerminate = ()=>{
        (0, _cpuprofile.saveCpuProfile)();
        process.exit(143);
    };
    const onInterrupt = ()=>{
        (0, _cpuprofile.saveCpuProfile)();
        process.exit(130);
    };
    process.on('SIGTERM', onTerminate);
    process.on('SIGINT', onInterrupt);
    const { analyze, experimentalAnalyze, debug, debugPrerender, experimentalDebugMemoryUsage, profile, mangling, experimentalAppOnly, experimentalBuildMode, experimentalUploadTrace, debugBuildPaths } = options;
    let traceUploadUrl;
    if (experimentalUploadTrace && !process.env.NEXT_TRACE_UPLOAD_DISABLED) {
        traceUploadUrl = experimentalUploadTrace;
    }
    const bundler = (0, _bundler.parseBundlerArgs)(options);
    if ((analyze || experimentalAnalyze) && bundler !== _bundler.Bundler.Turbopack) {
        (0, _utils.printAndExit)('--analyze is only compatible with the Turbopack bundler.');
    }
    if (!mangling) {
        (0, _log.warn)(`Mangling is disabled. ${(0, _picocolors.italic)('Note: This may affect performance and should only be used for debugging purposes.')}`);
    }
    if (profile) {
        (0, _log.warn)(`Profiling is enabled. ${(0, _picocolors.italic)('Note: This may affect performance.')}`);
    }
    if (debugPrerender) {
        (0, _log.warn)(`Prerendering is running in debug mode with NODE_ENV='development'. ${(0, _picocolors.italic)('This will affect performance and should not be used for production.')}`);
    }
    if (experimentalDebugMemoryUsage) {
        process.env.EXPERIMENTAL_DEBUG_MEMORY_USAGE = '1';
        (0, _startup.enableMemoryDebuggingMode)();
    }
    const dir = (0, _getprojectdir.getProjectDir)(directory);
    (0, _warnmissingreactdependencies.warnMissingReactDependencies)(dir);
    if (!(0, _fs.existsSync)(dir)) {
        (0, _utils.printAndExit)(`> No such directory exists as the project root: ${dir}`);
    }
    let debugBuildPathsPatterns;
    if (debugBuildPaths) {
        const patterns = (0, _resolvebuildpaths.parseBuildPathsInput)(debugBuildPaths);
        if (patterns.length > 0) {
            debugBuildPathsPatterns = patterns;
        }
    }
    const enabledFeatures = Object.fromEntries(Object.entries({
        experimentalDebugMemoryUsage,
        experimentalBuildMode: experimentalBuildMode !== 'default' ? experimentalBuildMode : undefined,
        experimentalCpuProf: options.experimentalCpuProf
    }).filter(([_, value])=>value !== undefined && value !== false));
    return (0, _build.default)(dir, analyze || experimentalAnalyze, profile, debug || Boolean(process.env.NEXT_DEBUG_BUILD), debugPrerender, !mangling, experimentalAppOnly, bundler, experimentalBuildMode, traceUploadUrl, debugBuildPathsPatterns, enabledFeatures).catch((err)=>{
        if (experimentalDebugMemoryUsage) {
            (0, _shutdown.disableMemoryDebuggingMode)();
        }
        console.error('');
        if ((0, _iserror.default)(err) && (err.code === 'INVALID_RESOLVE_ALIAS' || err.code === 'WEBPACK_ERRORS' || err.code === 'BUILD_OPTIMIZATION_FAILED' || err.code === 'NEXT_EXPORT_ERROR' || err.code === 'NEXT_STATIC_GEN_BAILOUT' || err.code === 'EDGE_RUNTIME_UNSUPPORTED_API')) {
            (0, _utils.printAndExit)(`> ${err.message}`);
        } else {
            console.error('> Build error occurred');
            (0, _utils.printAndExit)(err);
        }
    }).finally(()=>{
        if (experimentalDebugMemoryUsage) {
            (0, _shutdown.disableMemoryDebuggingMode)();
        }
    });
};
// Debugger and profiler runs stay in one process and skip the menu. Otherwise
// the debugger would attach to the wrong process, or there would be two
// profiles.
async function shouldBuildInChild() {
    const nodeOptions = (0, _utils.getParsedNodeOptions)();
    if (process.env.NEXT_CPU_PROF || (0, _utils.getNodeDebugType)(nodeOptions) || [
        'inspect-wait',
        'cpu-prof',
        'heap-prof',
        'prof'
    ].some((flag)=>nodeOptions[flag])) {
        return false;
    }
    const { shouldPromptForUpgrade } = await import('../lib/upgrade/nudge.js');
    return shouldPromptForUpgrade();
}
// Always exits by itself; the caller would exit with 0 if this returned.
async function buildInChild() {
    // Rerun the same command as a child, with its output piped to us.
    const child = (0, _child_process.fork)(process.argv[1], process.argv.slice(2), {
        stdio: [
            'inherit',
            'pipe',
            'pipe',
            'ipc'
        ],
        env: {
            ...process.env,
            ...(0, _promptoutput.getPromptOutputEnv)(),
            NEXT_PRIVATE_UPGRADE_BUILD_CHILD: '1'
        }
    });
    const exited = (0, _events.once)(child, 'exit');
    const output = (0, _promptoutput.createPromptOutput)();
    output.attach(child);
    // Don't leave the build running if we exit first.
    process.on('exit', ()=>child.kill());
    // Pass signals to the build and close the menu. Remember the signal: the
    // build may already be done, and then its exit code says nothing about it.
    const controller = new AbortController();
    const aborted = (0, _events.once)(controller.signal, 'abort');
    const signals = [
        'SIGINT',
        'SIGTERM',
        'SIGHUP'
    ];
    let received;
    function onSignal(signal) {
        received ??= signal;
        controller.abort();
        child.kill(signal);
    }
    for (const signal of signals){
        process.on(signal, onSignal);
    }
    // The child asks for the menu once it has loaded the config.
    let menu;
    child.on('message', (message)=>{
        const { nextUpgradeContext: context, dir } = message ?? {};
        if (!context || !dir || menu) {
            return;
        }
        menu = (async ()=>{
            const result = await (0, _promptoutput.showUpgradeMenu)(output, {
                dir,
                context,
                command: 'build',
                signal: controller.signal,
                initialAssessment: null,
                telemetryDisabled: message.telemetryDisabled
            });
            if (result === 'interrupt') {
                // Ctrl+C in the menu
                onSignal('SIGINT');
            } else if (result) {
                // Upgrade: show the result of a build that already finished, or stop
                // the build and drop its output.
                const finished = child.exitCode !== null || child.signalCode !== null;
                if (finished) {
                    output.release();
                } else {
                    output.discard();
                }
                child.kill('SIGTERM');
                await exited;
                // Stopped while the build was ending. Exit below with the signal.
                if (received) {
                    return;
                }
                // From here Ctrl+C should stop the upgrade, so stop catching it.
                for (const signal of signals){
                    process.off(signal, onSignal);
                }
                const { runUpgrade } = await import('../lib/upgrade/nudge.js');
                const exitCode = await runUpgrade(dir, result.policy, result.nudgeId);
                await (0, _promptoutput.flushUpgradeTelemetry)();
                // A build that failed still fails the command.
                process.exit(exitCode || (finished ? child.exitCode ?? 1 : 0));
            }
        })();
    });
    // If the build finishes first, keep the menu up until the user answers.
    const [code, signal] = await exited;
    (0, _promptoutput.reassertRawMode)();
    await (0, _promptoutput.drainPromptOutput)(child);
    // After a signal, don't wait on a network check the menu may still be making.
    await Promise.race([
        menu,
        aborted.then(()=>(0, _promptoutput.closedUpgradeMenu)(menu))
    ]);
    await (0, _promptoutput.flushUpgradeTelemetry)();
    const stoppedBy = received ?? signal;
    process.exit(stoppedBy ? 128 + _os.default.constants.signals[stoppedBy] : code);
}

//# sourceMappingURL=next-build.js.map