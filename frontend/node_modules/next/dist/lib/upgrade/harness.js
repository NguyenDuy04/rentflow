"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "handoffUpgrade", {
    enumerable: true,
    get: function() {
        return handoffUpgrade;
    }
});
const _fs = require("fs");
const _promises = require("fs/promises");
const _path = require("path");
const _cliselect = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/cli-select"));
const _crossspawn = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/cross-spawn"));
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _agentname = require("../../telemetry/agent-name");
const _picocolors = require("../picocolors");
const _modeldiscovery = require("./model-discovery");
const _runchildprocess = require("./run-child-process");
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
const CODEX_APPROVAL_ARGS = [
    '--sandbox',
    'workspace-write',
    '--ask-for-approval',
    'on-request'
];
function resolvePrompt(prompt, useWorktree) {
    return typeof prompt === 'string' ? prompt : prompt(useWorktree);
}
async function chooseOption(question, values, defaultValue, firstPrompt = false) {
    _log.bootstrap('');
    _log.bootstrap(`  ${question}`);
    _log.bootstrap(`  ${(0, _picocolors.dim)(`Use ↑/↓ to choose, Enter to confirm, or Esc to ${firstPrompt ? 'cancel' : 'go back'}.`)}\n`);
    let interrupted = false;
    const onKeypress = (_text, key)=>{
        if (key.ctrl && key.name === 'c') {
            interrupted = true;
        }
    };
    process.stdin.on('keypress', onKeypress);
    try {
        const { id } = await (0, _cliselect.default)({
            values,
            defaultValue,
            selected: (0, _picocolors.cyan)('❯'),
            unselected: ' ',
            indentation: 2,
            valueRenderer: (value, selected)=>selected ? (0, _picocolors.cyan)((0, _picocolors.bold)(value)) : value
        });
        if (typeof id === 'string') {
            _log.bootstrap(`  ${(0, _picocolors.cyan)('❯')} ${(0, _picocolors.cyan)((0, _picocolors.bold)(values[id]))}`);
            return id;
        }
        return undefined;
    } catch (error) {
        if (error !== undefined) {
            throw error;
        }
        return interrupted ? null : undefined;
    } finally{
        process.stdin.removeListener('keypress', onKeypress);
    }
}
async function chooseWorktree() {
    const choice = await chooseOption('Open the upgrade in a separate Git worktree?', {
        yes: 'Yes',
        no: 'No'
    }, 0);
    if (choice === null || choice === undefined) {
        return choice;
    }
    if (choice === 'yes') {
        return true;
    }
    if (choice === 'no') {
        return false;
    }
    throw new Error(`Unknown worktree choice: ${choice}`);
}
function getHarnessDisplayName(name) {
    return name === 'codex' ? 'Codex' : 'Claude Code';
}
function supportsCodexAutoReview(path) {
    const result = _crossspawn.default.sync(path, [
        '--help'
    ], {
        encoding: 'utf8',
        timeout: 5000
    });
    return result.status === 0 && /--approve-for-me\b/.test(result.stdout ?? '');
}
function getClaudePermissionSupport(path) {
    var _result_stdout_match, _result_stdout, _permissionModeHelp_match;
    const result = _crossspawn.default.sync(path, [
        '--help'
    ], {
        encoding: 'utf8',
        timeout: 5000
    });
    const permissionModeHelp = result.status === 0 ? (_result_stdout = result.stdout) == null ? void 0 : (_result_stdout_match = _result_stdout.match(/--permission-mode[^\n]*(?:\n[ \t]{8,}[^\n]*){0,4}/)) == null ? void 0 : _result_stdout_match[0] : null;
    const choices = permissionModeHelp == null ? void 0 : (_permissionModeHelp_match = permissionModeHelp.match(/\(choices:\s*([^)]+)\)/)) == null ? void 0 : _permissionModeHelp_match[1];
    const supportedModes = new Set((choices == null ? void 0 : choices.match(/[A-Za-z]+/g)) ?? []);
    return {
        auto: supportedModes.has('auto'),
        approvalMode: supportedModes.has('manual') ? 'manual' : supportedModes.has('default') ? 'default' : null
    };
}
async function findHarnesses() {
    const names = [
        'codex',
        'claude'
    ];
    const directories = (process.env.PATH ?? '').split(_path.delimiter).filter(Boolean);
    const extensions = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';').filter(Boolean) : [
        ''
    ];
    // Probe agents independently, preserving menu order and each detected path.
    const installed = await Promise.all(names.map(async (name)=>{
        for (const directory of directories){
            for (const extension of extensions){
                const file = (0, _path.resolve)(directory, `${name}${extension}`);
                try {
                    await (0, _promises.access)(file, process.platform === 'win32' ? _fs.constants.F_OK : _fs.constants.X_OK);
                    if ((await (0, _promises.stat)(file)).isFile()) {
                        return {
                            name,
                            path: file
                        };
                    }
                } catch (error) {
                    const code = error.code;
                    if (code === 'ENOENT' || code === 'EACCES' || code === 'ENOTDIR' || code === 'ELOOP') {
                        continue;
                    }
                    throw new Error(`Could not inspect coding agent at ${file}.`, {
                        cause: error
                    });
                }
            }
        }
        return null;
    }));
    return installed.filter((harness)=>harness !== null);
}
async function chooseHarness(harnesses, previousName) {
    const question = harnesses.length === 1 ? `${getHarnessDisplayName(harnesses[0].name)} detected. Would you like to proceed?` : 'Multiple coding agents detected. Which one would you like to use?';
    const id = await chooseOption(question, {
        ...Object.fromEntries(harnesses.map(({ name })=>[
                name,
                `Continue with ${getHarnessDisplayName(name)}`
            ])),
        copy: 'Copy prompt for another coding agent'
    }, Math.max(0, harnesses.findIndex(({ name })=>name === previousName)), true);
    return id === 'copy' ? 'copy' : harnesses.find(({ name })=>name === id);
}
function copyUpgradePrompt(prompt, noHarness) {
    const commands = process.platform === 'darwin' ? [
        [
            'pbcopy'
        ]
    ] : process.platform === 'win32' ? [
        [
            'clip.exe'
        ]
    ] : [
        [
            'wl-copy'
        ],
        [
            'xclip',
            '-selection',
            'clipboard'
        ],
        [
            'xsel',
            '--clipboard',
            '--input'
        ]
    ];
    for (const [command, ...args] of commands){
        const result = _crossspawn.default.sync(command, args, {
            input: process.platform === 'win32' ? Buffer.from(prompt, 'utf16le') : prompt,
            stdio: [
                'pipe',
                'ignore',
                'ignore'
            ],
            timeout: 1000,
            windowsHide: true
        });
        if (!result.error && result.status === 0) {
            _log.info(noHarness ? 'No supported coding agent found. The upgrade prompt was copied to your clipboard.' : 'Upgrade prompt copied. Paste it into your coding agent.');
            return 'copied_prompt';
        }
    }
    _log.info(noHarness ? 'No supported coding agent found. Copy this upgrade prompt:' : 'Could not access the clipboard. Copy this upgrade prompt:');
    _log.bootstrap(prompt);
    return 'printed_prompt';
}
function launchHarness(harness, prompt, directory, model, effort, permissionArgs, onSpawn) {
    // Windows shell shims cannot carry literal line breaks in an argument.
    if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(harness.path)) {
        prompt = prompt.replace(/[\r\n]+/g, ' ');
    }
    const args = model === null ? [] : [
        '--model',
        model
    ];
    if (effort !== 'default') {
        if (harness.name === 'codex') {
            args.push('-c', `model_reasoning_effort=${effort}`);
        } else {
            args.push('--effort', effort);
        }
    }
    args.push(...permissionArgs);
    args.push(prompt);
    return (0, _runchildprocess.runChildProcess)(harness.path, args, {
        cwd: directory,
        stdio: 'inherit'
    }, onSpawn);
}
async function handoffUpgrade(prompt, directory, onHandoff) {
    // Existing agents keep their session and permissions.
    const existingAgent = await (0, _agentname.getAgentName)();
    if (existingAgent) {
        _log.bootstrap(resolvePrompt(prompt, null));
        onHandoff == null ? void 0 : onHandoff('existing_agent', existingAgent);
        return 'handed_off';
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        _log.info('Copy this upgrade prompt into your coding agent:');
        _log.bootstrap(resolvePrompt(prompt, null));
        onHandoff == null ? void 0 : onHandoff('printed_prompt', null);
        return 'handed_off';
    }
    _log.info((0, _picocolors.dim)('Looking for coding agents...'));
    const installed = await findHarnesses();
    if (installed.length === 0) {
        const method = copyUpgradePrompt(resolvePrompt(prompt, null), true);
        onHandoff == null ? void 0 : onHandoff(method, null);
        return 'handed_off';
    }
    const discoveryController = new AbortController();
    const modelCatalogs = new Map(installed.map(({ name, path })=>[
            name,
            (0, _modeldiscovery.getHarnessModels)(name, path, directory, discoveryController.signal)
        ]));
    const stopDiscovery = async ()=>{
        discoveryController.abort();
        await Promise.all(modelCatalogs.values());
    };
    try {
        let stage = 'harness';
        let harness;
        let model;
        let effort;
        let autoPermissionArgs = null;
        let approvalPermissionArgs = [];
        let permissionArgs = [];
        let useAuto = true;
        let useWorktree = true;
        const previousModelStage = ()=>model ? model.efforts.length > 0 ? 'effort' : 'model' : 'harness';
        let codexAutoReview;
        let claudePermissionSupport;
        while(true){
            if (stage === 'harness') {
                const choice = await chooseHarness(installed, harness == null ? void 0 : harness.name);
                if (choice === 'copy') {
                    const method = copyUpgradePrompt(resolvePrompt(prompt, null), false);
                    onHandoff == null ? void 0 : onHandoff(method, null);
                    return 'handed_off';
                }
                if (!choice) {
                    break;
                }
                harness = choice;
                stage = 'model';
            } else if (stage === 'model') {
                const models = await modelCatalogs.get(harness.name);
                if (models === null) {
                    break;
                }
                if (models.length === 0) {
                    model = undefined;
                    effort = 'default';
                    stage = 'effort';
                    continue;
                }
                const selectedModelId = model == null ? void 0 : model.id;
                const previousModelId = models.some(({ id })=>id === selectedModelId) ? selectedModelId : undefined;
                const modelId = await chooseOption(`Which ${getHarnessDisplayName(harness.name)} model should run the upgrade?`, Object.fromEntries(models.map(({ id, label, description })=>[
                        id,
                        description ? `${label} — ${description}` : label
                    ])), Math.max(0, models.findIndex(({ id, isDefault })=>previousModelId ? id === previousModelId : isDefault)));
                if (modelId === null) {
                    break;
                }
                if (modelId === undefined) {
                    stage = 'harness';
                    continue;
                }
                model = models.find(({ id })=>id === modelId);
                if (!model) {
                    throw new Error(`Unknown upgrade model: ${modelId}`);
                }
                if (!model.efforts.includes(effort ?? 'default')) {
                    effort = 'default';
                }
                stage = 'effort';
            } else if (stage === 'effort') {
                if (model && model.efforts.length > 0) {
                    const efforts = [
                        'default',
                        ...model.efforts
                    ];
                    const previousEffortIndex = efforts.indexOf(effort ?? 'default');
                    const selectedEffort = await chooseOption('Which reasoning effort should the upgrade use?', Object.fromEntries(efforts.map((value)=>[
                            value,
                            value === 'default' ? 'Model default' : value
                        ])), Math.max(0, previousEffortIndex));
                    if (selectedEffort === null) {
                        break;
                    }
                    if (selectedEffort === undefined) {
                        stage = 'model';
                        continue;
                    }
                    if (!efforts.includes(selectedEffort)) {
                        throw new Error(`Unknown upgrade effort: ${selectedEffort}`);
                    }
                    effort = selectedEffort;
                }
                if (harness.name === 'codex') {
                    codexAutoReview ??= supportsCodexAutoReview(harness.path);
                    autoPermissionArgs = codexAutoReview ? [
                        '--approve-for-me'
                    ] : null;
                    approvalPermissionArgs = [
                        ...CODEX_APPROVAL_ARGS
                    ];
                } else {
                    const { auto, approvalMode } = claudePermissionSupport ??= getClaudePermissionSupport(harness.path);
                    if (!approvalMode) {
                        _log.error('Could not determine a supported Claude approval mode.');
                        process.exitCode = 1;
                        return 'failed';
                    }
                    autoPermissionArgs = auto ? [
                        '--permission-mode',
                        'auto'
                    ] : null;
                    approvalPermissionArgs = [
                        '--permission-mode',
                        approvalMode
                    ];
                }
                if (autoPermissionArgs) {
                    stage = 'permission';
                } else {
                    _log.info((0, _picocolors.dim)('Auto permission mode is unavailable; using approval requests.'));
                    permissionArgs = approvalPermissionArgs;
                    stage = 'worktree';
                }
            } else if (stage === 'permission') {
                const permissionChoice = await chooseOption(`Use Auto permission mode for ${getHarnessDisplayName(harness.name)}?`, {
                    yes: 'Yes',
                    no: 'No, ask for approval'
                }, useAuto ? 0 : 1);
                if (permissionChoice === null) {
                    break;
                }
                if (permissionChoice === undefined) {
                    stage = previousModelStage();
                    continue;
                }
                useAuto = permissionChoice === 'yes';
                permissionArgs = useAuto ? autoPermissionArgs : approvalPermissionArgs;
                stage = 'worktree';
            } else {
                const choice = await chooseWorktree();
                if (choice === null) {
                    break;
                }
                if (choice === undefined) {
                    stage = autoPermissionArgs ? 'permission' : previousModelStage();
                    continue;
                }
                useWorktree = choice;
                _log.bootstrap(`  Continuing with ${(0, _picocolors.cyan)((0, _picocolors.bold)(getHarnessDisplayName(harness.name)))}...\n`);
                // Capture the selected agent before the launch callback runs.
                const agentProduct = harness.name;
                await stopDiscovery();
                try {
                    process.exitCode = await launchHarness(harness, resolvePrompt(prompt, useWorktree), directory, (model == null ? void 0 : model.id) ?? null, effort, permissionArgs, ()=>onHandoff == null ? void 0 : onHandoff('launched_agent', agentProduct));
                } catch  {
                    _log.error(`Could not start ${getHarnessDisplayName(harness.name)}.`);
                    process.exitCode = 1;
                    return 'failed';
                }
                return 'handed_off';
            }
        }
        _log.bootstrap(`  ${(0, _picocolors.dim)('Upgrade cancelled.')}\n`);
        process.exitCode = 1;
        return 'cancelled';
    } finally{
        await stopDiscovery();
    }
}

//# sourceMappingURL=harness.js.map