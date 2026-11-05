"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getClaudeModels: null,
    getCodexModels: null,
    getHarnessModels: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getClaudeModels: function() {
        return getClaudeModels;
    },
    getCodexModels: function() {
        return getCodexModels;
    },
    getHarnessModels: function() {
        return getHarnessModels;
    }
});
const _crypto = require("crypto");
const _crossspawn = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/cross-spawn"));
const _debug = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/debug"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = (0, _debug.default)('next:upgrade');
function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function string(value) {
    return typeof value === 'string' ? value : '';
}
function efforts(value) {
    return Array.isArray(value) ? [
        ...new Set(value.map(string).filter((level)=>level && level !== 'default'))
    ] : [];
}
function parseModels(value, parse) {
    if (!Array.isArray(value)) {
        throw new Error('unexpected model catalog format');
    }
    return value.map((entry)=>parse(record(entry))).filter((model)=>model !== null);
}
function getCodexModels(path, cwd, signal) {
    return discoverModels('codex', path, [
        'app-server'
    ], cwd, signal, (send, complete)=>{
        const initializeId = (0, _crypto.randomUUID)();
        let listId;
        const models = [];
        const cursors = new Set();
        const list = (cursor)=>{
            listId = (0, _crypto.randomUUID)();
            send({
                id: listId,
                method: 'model/list',
                params: {
                    includeHidden: false,
                    ...cursor ? {
                        cursor
                    } : {}
                }
            });
        };
        return {
            initialize () {
                send({
                    id: initializeId,
                    method: 'initialize',
                    params: {
                        clientInfo: {
                            name: 'next_upgrade',
                            version: '1'
                        }
                    }
                });
            },
            receive (message) {
                if (message.id !== initializeId && (listId === undefined || message.id !== listId)) return;
                if (message.error) throw new Error('CLI returned a protocol error');
                if (message.id === initializeId) {
                    if (!message.result) throw new Error('missing initialization result');
                    send({
                        method: 'initialized'
                    });
                    list();
                    return;
                }
                const response = record(message.result);
                models.push(...parseModels(response.data, (model)=>{
                    const id = string(model.model);
                    if (!id || model.hidden === true) return null;
                    return {
                        id,
                        label: string(model.displayName) || id,
                        description: string(model.description),
                        efforts: efforts(Array.isArray(model.supportedReasoningEfforts) ? model.supportedReasoningEfforts.map((level)=>record(level).reasoningEffort) : undefined),
                        isDefault: model.isDefault === true
                    };
                }));
                const cursor = response.nextCursor;
                if (cursor !== null && cursor !== undefined) {
                    if (typeof cursor !== 'string' || !cursor || cursors.has(cursor)) {
                        throw new Error('invalid pagination cursor');
                    }
                    cursors.add(cursor);
                    list(cursor);
                    return;
                }
                complete(models);
            }
        };
    });
}
function getClaudeModels(path, cwd, signal) {
    return discoverModels('claude', path, [
        '-p',
        '--input-format',
        'stream-json',
        '--output-format',
        'stream-json',
        '--verbose',
        '--no-session-persistence'
    ], cwd, signal, (send, complete)=>{
        const initializeId = (0, _crypto.randomUUID)();
        return {
            initialize () {
                send({
                    type: 'control_request',
                    request_id: initializeId,
                    request: {
                        subtype: 'initialize'
                    }
                });
            },
            receive (message) {
                if (message.type !== 'control_response') return;
                const response = record(message.response);
                if (response.request_id !== initializeId) return;
                if (response.subtype !== 'success') throw new Error('CLI returned an initialization error');
                complete(parseModels(record(response.response).models, (model)=>{
                    const id = string(model.value);
                    if (!id) return null;
                    return {
                        id,
                        label: string(model.displayName) || id,
                        description: string(model.description),
                        efforts: model.supportsEffort === false ? [] : efforts(model.supportedEffortLevels),
                        isDefault: id === 'default'
                    };
                }));
            }
        };
    });
}
function getHarnessModels(name, path, cwd, signal) {
    return name === 'codex' ? getCodexModels(path, cwd, signal) : getClaudeModels(path, cwd, signal);
}
// null means discovery was cancelled, rather than an unavailable catalog.
async function discoverModels(name, path, args, cwd, signal, createProtocol) {
    if (signal == null ? void 0 : signal.aborted) return null;
    let child;
    try {
        child = (0, _crossspawn.default)(path, args, {
            cwd,
            stdio: 'pipe'
        });
    } catch  {
        debug('%s model discovery failed: could not start CLI', name);
        return [];
    }
    return new Promise((resolve)=>{
        var _child_stdout, _child_stdout1, // Drain stderr, but never log raw CLI output (which may contain credentials).
        _child_stderr, _child_stdin;
        let buffer = '';
        let bytes = 0;
        let stopping = false;
        let result = [];
        let killTimer;
        const stop = (value, reason)=>{
            var _child_stdin;
            if (stopping) return;
            stopping = true;
            result = value;
            clearTimeout(timeout);
            if (reason) debug('%s model discovery failed: %s', name, reason);
            (_child_stdin = child.stdin) == null ? void 0 : _child_stdin.end();
            child.kill('SIGTERM');
            killTimer = setTimeout(()=>child.kill('SIGKILL'), 250);
        };
        const timeout = setTimeout(()=>stop([], 'timed out'), 5000);
        const interrupt = ()=>stop(null);
        process.on('SIGINT', interrupt);
        process.on('SIGTERM', interrupt);
        process.on('SIGHUP', interrupt);
        const send = (message)=>{
            var _child_stdin;
            if (!stopping) (_child_stdin = child.stdin) == null ? void 0 : _child_stdin.write(JSON.stringify(message) + '\n');
        };
        const protocol = createProtocol(send, (models)=>{
            const unique = [
                ...new Map(models.map((model)=>[
                        model.id,
                        model
                    ])).values()
            ];
            stop(unique, unique.length ? undefined : 'no usable models');
        });
        signal == null ? void 0 : signal.addEventListener('abort', interrupt, {
            once: true
        });
        const countOutput = (chunk)=>{
            bytes += Buffer.byteLength(chunk);
            if (bytes > 20 * 1024 * 1024) stop([], 'output limit exceeded');
        };
        (_child_stdout = child.stdout) == null ? void 0 : _child_stdout.setEncoding('utf8');
        (_child_stdout1 = child.stdout) == null ? void 0 : _child_stdout1.on('data', (chunk)=>{
            countOutput(chunk);
            if (stopping) return;
            buffer += chunk;
            let newline;
            while(!stopping && (newline = buffer.indexOf('\n')) !== -1){
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!line) continue;
                try {
                    protocol.receive(record(JSON.parse(line)));
                } catch  {
                    stop([], 'invalid discovery response');
                }
            }
        });
        (_child_stderr = child.stderr) == null ? void 0 : _child_stderr.on('data', countOutput);
        (_child_stdin = child.stdin) == null ? void 0 : _child_stdin.on('error', ()=>stop([], 'could not write discovery request'));
        child.on('error', ()=>stop([], 'could not start CLI'));
        child.once('close', ()=>{
            clearTimeout(timeout);
            clearTimeout(killTimer);
            process.removeListener('SIGINT', interrupt);
            process.removeListener('SIGTERM', interrupt);
            process.removeListener('SIGHUP', interrupt);
            signal == null ? void 0 : signal.removeEventListener('abort', interrupt);
            if (!stopping) debug('%s model discovery failed: CLI exited early', name);
            resolve(result);
        });
        child.once('spawn', protocol.initialize);
    });
}

//# sourceMappingURL=model-discovery.js.map