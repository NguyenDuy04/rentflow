"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "runChildProcess", {
    enumerable: true,
    get: function() {
        return runChildProcess;
    }
});
const _os = require("os");
const _crossspawn = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/cross-spawn"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function runChildProcess(command, args, options, onSpawn) {
    const child = (0, _crossspawn.default)(command, args, options);
    return new Promise((resolve, reject)=>{
        const onInterrupt = ()=>child.kill('SIGINT');
        const onTerminate = ()=>child.kill('SIGTERM');
        const onHangup = ()=>child.kill('SIGHUP');
        process.on('SIGINT', onInterrupt);
        process.on('SIGTERM', onTerminate);
        process.on('SIGHUP', onHangup);
        const cleanup = ()=>{
            process.removeListener('SIGINT', onInterrupt);
            process.removeListener('SIGTERM', onTerminate);
            process.removeListener('SIGHUP', onHangup);
        };
        // Report delivery when the child starts, without waiting for the agent's work to finish.
        if (onSpawn) {
            child.once('spawn', ()=>{
                try {
                    onSpawn();
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            });
        }
        child.once('error', (error)=>{
            cleanup();
            reject(error);
        });
        child.once('close', (code, signal)=>{
            cleanup();
            resolve(code ?? (signal ? 128 + (_os.constants.signals[signal] ?? 1) : 1));
        });
    });
}

//# sourceMappingURL=run-child-process.js.map