"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    closedUpgradeMenu: null,
    createPromptOutput: null,
    drainPromptOutput: null,
    flushUpgradeTelemetry: null,
    getPromptOutputEnv: null,
    reassertRawMode: null,
    showUpgradeMenu: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    closedUpgradeMenu: function() {
        return closedUpgradeMenu;
    },
    createPromptOutput: function() {
        return createPromptOutput;
    },
    drainPromptOutput: function() {
        return drainPromptOutput;
    },
    flushUpgradeTelemetry: function() {
        return flushUpgradeTelemetry;
    },
    getPromptOutputEnv: function() {
        return getPromptOutputEnv;
    },
    reassertRawMode: function() {
        return reassertRawMode;
    },
    showUpgradeMenu: function() {
        return showUpgradeMenu;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _storage = require("../../telemetry/storage");
const _events = require("events");
const _promises = require("timers/promises");
const _picocolors = require("../picocolors");
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
// Keep at most this much while the menu is open, so a menu left open doesn't
// grow memory without bound.
const MAX_HELD_BYTES = 10 * 1024 * 1024;
function createPromptOutput() {
    // print: show now. hold: keep for later. drop: throw away.
    let mode = 'print';
    // One list for stdout and stderr keeps their order.
    let held = [];
    let heldBytes = 0;
    let droppedBytes = 0;
    function forward(destination) {
        return (chunk)=>{
            if (mode === 'print') {
                destination.write(chunk);
            } else if (mode === 'hold') {
                held.push([
                    destination,
                    chunk
                ]);
                heldBytes += chunk.length;
                // Over the limit: drop the oldest output.
                while(heldBytes > MAX_HELD_BYTES && held.length > 1){
                    const [, oldest] = held.shift();
                    heldBytes -= oldest.length;
                    droppedBytes += oldest.length;
                }
            }
        };
    }
    return {
        attach (child) {
            child.stdout.on('data', forward(process.stdout));
            child.stderr.on('data', forward(process.stderr));
        },
        // The menu opened.
        hold () {
            mode = 'hold';
        },
        // The menu closed: show what was held.
        release () {
            mode = 'print';
            if (droppedBytes > 0) {
                _log.warn(`${droppedBytes} bytes of earlier output were dropped while the upgrade menu was open.`);
            }
            for (const [destination, chunk] of held){
                destination.write(chunk);
            }
            held = [];
        },
        // Upgrade was chosen and the child is stopping, so its output doesn't
        // matter.
        discard () {
            mode = 'drop';
            held = [];
        }
    };
}
async function drainPromptOutput(child) {
    var _child_stderr;
    // The pipes are often closed by the time 'exit' fires, and then 'close' has
    // already been sent.
    if (!child.stdout || child.stdout.destroyed && ((_child_stderr = child.stderr) == null ? void 0 : _child_stderr.destroyed)) {
        return;
    }
    await Promise.race([
        (0, _events.once)(child, 'close'),
        (0, _promises.setTimeout)(500)
    ]);
}
function getPromptOutputEnv() {
    const { FORCE_COLOR, NODE_DISABLE_COLORS } = process.env;
    return {
        FORCE_COLOR: // An empty FORCE_COLOR means "on" to Node but "unset" to picocolors.
        FORCE_COLOR || (_picocolors.isColorSupported && !NODE_DISABLE_COLORS ? '1' : FORCE_COLOR),
        NEXT_PRIVATE_PROMPT_OUTPUT: '1',
        NEXT_PRIVATE_TERMINAL_COLUMNS: process.stdout.columns ? String(process.stdout.columns) : undefined
    };
}
function reassertRawMode() {
    const stdin = process.stdin;
    if (stdin.isTTY && stdin.isRaw) {
        // Node skips setting a mode it thinks is already set, so toggle.
        stdin.setRawMode(false);
        stdin.setRawMode(true);
    }
}
let pendingTelemetry;
async function showUpgradeMenu(output, options) {
    const { dir, context, command, signal, initialAssessment } = options;
    const { nudgeUpgrade } = require('./nudge');
    if (options.telemetryDisabled) {
        process.env.NEXT_TELEMETRY_DISABLED = options.telemetryDisabled;
    }
    const telemetry = new _storage.Telemetry({
        distDir: _path.default.join(dir, context.distDir),
        skipNotify: true
    });
    let nudgeId = null;
    // onNudgeId runs as the menu draws, so holding starts at exactly that point.
    const action = await nudgeUpgrade(dir, context, command, signal, initialAssessment, {
        telemetry,
        onNudgeId (id) {
            nudgeId = id;
            output.hold();
        }
    }).catch((error)=>{
        _log.warn(`Could not offer the upgrade: ${String(error)}`);
    });
    // The answer is already being sent. Don't wait for it here, or Ctrl+C would
    // be ignored until it is done.
    pendingTelemetry = telemetry.flush();
    // Upgrade. The caller drops or shows what was held.
    const policy = context.experimental.agentUpgrade;
    if (action === 'update' && policy && !signal.aborted) {
        return {
            policy,
            nudgeId
        };
    }
    // Skip, Ctrl+C, or closed: show what was held.
    output.release();
    return action === 'interrupt' && !signal.aborted ? 'interrupt' : null;
}
async function closedUpgradeMenu(menu) {
    await Promise.race([
        menu,
        (0, _promises.setTimeout)(1000, undefined, {
            ref: false
        })
    ]);
}
async function flushUpgradeTelemetry() {
    await Promise.race([
        pendingTelemetry,
        (0, _promises.setTimeout)(1000, undefined, {
            ref: false
        })
    ]);
}

//# sourceMappingURL=prompt-output.js.map