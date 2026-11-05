import { constants as osConstants } from 'os';
import spawn from 'next/dist/compiled/cross-spawn';
export function runChildProcess(command, args, options, onSpawn) {
    const child = spawn(command, args, options);
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
            resolve(code ?? (signal ? 128 + (osConstants.signals[signal] ?? 1) : 1));
        });
    });
}

//# sourceMappingURL=run-child-process.js.map