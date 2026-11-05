"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    assessUpgrade: null,
    getUpgradeContext: null,
    nudgeUpgrade: null,
    runUpgrade: null,
    shouldPromptForUpgrade: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    assessUpgrade: function() {
        return assessUpgrade;
    },
    getUpgradeContext: function() {
        return getUpgradeContext;
    },
    nudgeUpgrade: function() {
        return nudgeUpgrade;
    },
    runUpgrade: function() {
        return runUpgrade;
    },
    shouldPromptForUpgrade: function() {
        return shouldPromptForUpgrade;
    }
});
const _child_process = require("child_process");
const _crypto = require("crypto");
const _promises = require("fs/promises");
const _path = require("path");
const _util = require("util");
const _env = require("@next/env");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _agentupgrade = require("../../telemetry/events/agent-upgrade");
const _semver = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/semver"));
const _agentname = require("../../telemetry/agent-name");
const _futuredefaults = require("./future-defaults");
const _ciinfo = require("../../server/ci-info");
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
function getRequestedUpgrade() {
    const policy = process.env.__NEXT_AGENT_UPGRADE;
    return policy === 'security' || policy === 'latest' || policy === 'experimental-future' ? policy : null;
}
const RETRY_TTL = 5 * 60 * 1000;
const allowedRetries = new Set(process.env.NEXT_PRIVATE_WORKER === '1' ? (process.env.NEXT_PRIVATE_ALLOWED_UPGRADE_RETRIES ?? '').split(',').filter((identity)=>/^[a-f0-9]{64}$/.test(identity)) : []);
function hasCode(error, code) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
async function writeRetry(path, issuedAt) {
    const temporary = `${path}.${(0, _crypto.randomUUID)()}.tmp`;
    try {
        await (0, _promises.writeFile)(temporary, JSON.stringify({
            issuedAt
        }), {
            mode: 384
        });
        await (0, _promises.rename)(temporary, path);
    } finally{
        await (0, _promises.rm)(temporary, {
            force: true
        });
    }
}
async function allowNudgeRetry({ directory, distDir, command }, version, kind) {
    const project = await (0, _promises.realpath)(directory);
    const identity = (0, _crypto.createHash)('sha256').update(`${project}\0${version}\0${command}\0${kind}`).digest('hex');
    if (allowedRetries.has(identity)) {
        return true;
    }
    const cache = (0, _path.resolve)(project, distDir, 'cache', 'next-agentic-upgrade-retries');
    const receipt = (0, _path.join)(cache, `${identity}.json`);
    const claimed = `${receipt}.${(0, _crypto.randomUUID)()}.claim`;
    await (0, _promises.mkdir)(cache, {
        recursive: true
    });
    try {
        await (0, _promises.rename)(receipt, claimed);
    } catch (error) {
        if (!hasCode(error, 'ENOENT')) {
            throw error;
        }
        await writeRetry(receipt, Date.now());
        return false;
    }
    let issuedAt;
    try {
        const value = JSON.parse(await (0, _promises.readFile)(claimed, 'utf8'));
        issuedAt = typeof value === 'object' && value !== null ? Reflect.get(value, 'issuedAt') : undefined;
    } catch  {
        issuedAt = undefined;
    } finally{
        await (0, _promises.rm)(claimed, {
            force: true
        });
    }
    const now = Date.now();
    if (typeof issuedAt === 'number' && issuedAt <= now && now - issuedAt < RETRY_TTL) {
        if (command === 'dev' && process.env.NEXT_PRIVATE_WORKER === '1') {
            await new Promise((complete, reject)=>{
                const message = {
                    nextUpgradeRetryAllowed: identity
                };
                process.send(message, (error)=>{
                    if (error) {
                        reject(error);
                    } else {
                        complete();
                    }
                });
            });
        }
        allowedRetries.add(identity);
        return true;
    }
    await writeRetry(receipt, Date.now());
    return false;
}
function getUpgradeContext(config) {
    return {
        distDir: config.distDir,
        cacheComponents: config.cacheComponents,
        configuredPolicy: config.experimental.agentUpgrade ?? null,
        experimental: {
            agentUpgrade: getRequestedUpgrade() ?? config.experimental.agentUpgrade ?? false
        }
    };
}
async function assessUpgrade(directory, config, installedVersion = "16.4.5" || 'unknown', stopBefore = null, forceVersionReminder = false) {
    const policy = config.experimental.agentUpgrade;
    if (policy !== 'security' && policy !== 'latest' && policy !== 'experimental-future') {
        return null;
    }
    if (isTerminalForcedForTesting()) {
        // Offer a fixed reminder without querying advisories or past dismissals.
        return {
            policy,
            installedVersion,
            kind: 'security',
            reference: null,
            targetVersion: installedVersion
        };
    }
    if (stopBefore === 'security') {
        return null;
    }
    if (!_semver.default.valid(installedVersion)) {
        return null;
    }
    const { getPrereleaseChannel, getUpgradeAssessment, getLatestUpgradeVersion } = require('./prepare-upgrade');
    if (_semver.default.prerelease(installedVersion) && !getPrereleaseChannel(installedVersion)) {
        return null;
    }
    let assessment;
    try {
        assessment = await getUpgradeAssessment(installedVersion, policy, stopBefore === 'latest');
    } catch  {
        _log.warn('Could not check Next.js security advisories. Continuing without an upgrade assessment.');
        return null;
    }
    const { upgrade } = assessment;
    if (upgrade.status !== 'ready') {
        // TODO: Record affected and upgrade.status in telemetry so we can see when
        // an advisory applies but no ready target was available to nudge.
        return null;
    }
    if (assessment.affected) {
        return {
            kind: 'security',
            policy,
            installedVersion,
            reference: assessment.reference,
            targetVersion: upgrade.targetVersion
        };
    }
    if (policy === 'security' || stopBefore === 'latest') {
        return null;
    }
    const latestVersion = getLatestUpgradeVersion(installedVersion, upgrade.targetVersion);
    if (latestVersion || forceVersionReminder && upgrade.targetVersion !== installedVersion) {
        return {
            kind: 'latest',
            policy,
            installedVersion,
            latestVersion: upgrade.targetVersion,
            names: policy === 'experimental-future' ? (0, _futuredefaults.getPendingFutureDefaults)(directory, config, upgrade.targetVersion).map((entry)=>entry.name) : []
        };
    }
    if (policy !== 'experimental-future' || stopBefore === 'experimental-future') {
        return null;
    }
    const pending = (0, _futuredefaults.getPendingFutureDefaults)(directory, config, installedVersion);
    if (pending.length === 0) {
        return null;
    }
    return {
        kind: 'experimental-future',
        policy,
        installedVersion,
        targetVersion: upgrade.targetVersion,
        names: pending.map((entry)=>entry.name)
    };
}
async function nudgeUpgradeForAgent(options, reminder, nudgeId, agentProduct, telemetry, policyEvent) {
    let summary;
    let recommendation;
    let reference = null;
    switch(reminder.kind){
        case 'security':
            summary = 'Your version of Next.js is affected by a known security vulnerability.';
            recommendation = 'We strongly recommend you upgrade Next.js.';
            reference = reminder.reference;
            break;
        case 'latest':
            var _semver_prerelease;
            summary = `Next.js ${reminder.latestVersion ?? '[latest version]'} is available. You're using ${reminder.installedVersion}.`;
            recommendation = 'We recommend you upgrade Next.js.';
            reference = `https://registry.npmjs.org/next/${((_semver_prerelease = _semver.default.prerelease(reminder.installedVersion)) == null ? void 0 : _semver_prerelease[0]) === 'canary' ? 'canary' : 'latest'}`;
            break;
        case 'experimental-future':
            summary = `Installed Next.js ${reminder.installedVersion} includes Future Defaults available for this app:\n\n${reminder.names.map((name)=>`- ${name}`).join('\n')}`;
            recommendation = 'We recommend you adopt these Future Defaults.';
            break;
    }
    // Pass attribution on the invocation using the same command syntax on every platform.
    const command = `next upgrade --agent=${reminder.policy} --internal-nudge-id=${nudgeId}`;
    const message = `${summary}

**${recommendation}**

This command stopped to show the upgrade recommendation. Retry the same command to continue the original task.

When you report back to the user, include this upgrade recommendation even if the retry succeeds.

At the end of the task, ask the user once: "Would you like me to run the '${reminder.policy}' upgrade in the background in a separate Git worktree? I can use the current checkout if you prefer." If the app is not in Git, say it will run in place. Use their worktree choice and continue in this agent session. Run this command from this app's directory:

\`\`\`
${command}
\`\`\`

${reference ? `Reference: ${reference}` : ''}`;
    let retryAllowed = false;
    try {
        retryAllowed = await allowNudgeRetry(options, reminder.installedVersion, reminder.kind);
    } catch  {
        _log.warn('Could not prepare an upgrade retry. This command will remain blocked.');
    }
    if (retryAllowed) {
        telemetry == null ? void 0 : telemetry.record(policyEvent);
        _log.warn(`${summary} This command is continuing after the upgrade reminder.${reference ? `\nReference: ${reference}` : ''}`);
        return;
    }
    // Queue the full nudge once, then send it outside the command that is about to stop.
    if (telemetry) {
        try {
            if (telemetry.isEnabled || process.env.NEXT_TELEMETRY_DEBUG) {
                telemetry.flushDetached({
                    mode: 'dev',
                    dir: options.directory,
                    distDir: (0, _path.resolve)(options.directory, options.distDir),
                    events: [
                        policyEvent,
                        (0, _agentupgrade.eventAgentUpgradeNudgeShown)({
                            nudgeId,
                            recipient: 'agent',
                            agentProduct,
                            sourceCommand: options.command,
                            policy: reminder.policy,
                            nudgeKind: reminder.kind
                        })
                    ]
                });
            }
        } catch (error) {
            _log.warn(`Could not queue upgrade telemetry: ${String(error)}`);
        }
    }
    const error = new Error(message);
    error.name = reminder.kind === 'security' ? 'SecurityFatalError' : 'UpgradeNudgeError';
    Object.assign(error, {
        exitCode: 1
    });
    throw error;
}
async function getUpgradePreferences(directory) {
    const Conf = require('next/dist/compiled/conf');
    const project = await (0, _promises.realpath)(directory);
    let identity = project;
    let projectName = (0, _path.basename)(project);
    try {
        const { stdout } = await (0, _util.promisify)(_child_process.execFile)('git', [
            'rev-parse',
            '--show-toplevel',
            '--git-common-dir'
        ], {
            cwd: project,
            timeout: 1000
        });
        const [root, common] = stdout.trimEnd().split('\n');
        const commonDirectory = await (0, _promises.realpath)((0, _path.resolve)(project, common));
        const appPath = (0, _path.relative)(await (0, _promises.realpath)(root), project);
        // Worktrees share a Git directory, but monorepo apps need separate keys.
        identity = `${commonDirectory}\0${appPath}`;
        projectName = (0, _path.basename)(appPath || ((0, _path.basename)(commonDirectory) === '.git' ? (0, _path.dirname)(commonDirectory) : commonDirectory));
    } catch  {
    // Apps outside Git (or without Git installed) keep their directory identity.
    }
    const hash = (0, _crypto.createHash)('sha256').update(identity).digest('hex');
    // Conf treats dots as separators, including dots in directory names.
    const name = encodeURIComponent(projectName).replace(/\./g, '%2E');
    const key = `agent-upgrade.${name}.${hash}`;
    // Upgrade preferences share Next.js' global config location, not telemetry consent.
    return {
        key,
        preferences: new Conf({
            projectName: 'nextjs'
        })
    };
}
// The terminal test needs a menu in CI and under agents, without the network.
function isTerminalForcedForTesting() {
    return process.env.__NEXT_AGENT_UPGRADE_FORCE_TERMINAL_FOR_TESTING === '1';
}
function canPromptForUpgrade() {
    return (!_ciinfo.isCI || isTerminalForcedForTesting()) && Boolean(process.stdin.isTTY && process.stdout.isTTY) && process.env.TERM !== 'dumb';
}
async function getUpgradeDismissal(directory, version, policy) {
    try {
        const { key, preferences } = await getUpgradePreferences(directory);
        for (const kind of [
            'security',
            'latest',
            'experimental-future'
        ]){
            if (preferences.get(`${key}.${kind}`) === `${version}:${policy}`) {
                return kind;
            }
        }
    } catch  {
    // A preferences failure must not prevent assessing or skipping a reminder.
    }
    return null;
}
async function nudgeUpgradeForHuman(directory, reminder, signal, onShown) {
    if (signal.aborted) {
        return 'skip';
    }
    let message;
    if (reminder.kind === 'security') {
        message = `⚠ Installed Next.js version ${reminder.installedVersion} is affected by a known security vulnerability.`;
        message += `\n\nNext.js security version upgrade available: ${reminder.installedVersion} -> ${reminder.targetVersion}`;
    } else if (reminder.policy === 'experimental-future') {
        const targetVersion = reminder.kind === 'latest' ? reminder.latestVersion : reminder.targetVersion;
        const versions = targetVersion !== reminder.installedVersion ? ` ${reminder.installedVersion} -> ${targetVersion ?? '[target version]'}` : '';
        message = `Next.js Future Default upgrade available:${versions}`;
        if (reminder.names.length > 0) {
            message += `\n\n${reminder.names.map((name)=>`- ${name}`).join('\n')}`;
        }
    } else if (reminder.kind === 'latest') {
        message = `Next.js latest version upgrade available: ${reminder.installedVersion} -> ${reminder.latestVersion ?? '[target version]'}`;
    } else {
        return 'skip';
    }
    const { promptUpgrade } = require('./prompt');
    const action = await promptUpgrade({
        message,
        signal,
        canUpdate: true,
        onShown
    });
    if (signal.aborted) {
        return 'skip';
    }
    if (action === 'dismiss') {
        try {
            const { key, preferences } = await getUpgradePreferences(directory);
            preferences.set(`${key}.${reminder.kind}`, `${reminder.installedVersion}:${reminder.policy}`);
        } catch  {
            _log.warn('Could not save your upgrade reminder preference. Skipping for this session.');
        }
    }
    return action;
}
async function runUpgrade(directory, policy, nudgeId) {
    // The agent's dev/build commands must not trigger this explicit request again.
    delete process.env.__NEXT_AGENT_UPGRADE;
    (0, _env.updateInitialEnv)({
        __NEXT_AGENT_UPGRADE: undefined
    });
    const { spawnNextUpgrade } = await import('../../cli/next-upgrade.js');
    // Human Update actions invoke the CLI directly, so their ID does not need an env var.
    await spawnNextUpgrade(directory, {
        revision: 'latest',
        verbose: false,
        agent: policy
    }, nudgeId ? {
        id: nudgeId,
        recipient: 'human'
    } : null);
    return process.exitCode ?? 0;
}
async function shouldPromptForUpgrade() {
    return canPromptForUpgrade() && (isTerminalForcedForTesting() || !await (0, _agentname.getAgentName)());
}
async function nudgeUpgrade(directory, config, command, signal, initialAssessment, telemetryOptions) {
    const requested = getRequestedUpgrade();
    const policy = requested ?? config.experimental.agentUpgrade;
    if (policy !== 'security' && policy !== 'latest' && policy !== 'experimental-future') {
        return;
    }
    // Observe the effective policy even when assessment finds no upgrade to offer.
    const telemetry = (telemetryOptions == null ? void 0 : telemetryOptions.telemetry) ?? null;
    const policyEvent = (0, _agentupgrade.eventAgentUpgradePolicyDetected)({
        configuredPolicy: config.configuredPolicy ?? null,
        effectivePolicy: policy,
        policySource: requested ? 'environment' : 'config',
        sourceCommand: command
    });
    if (requested && _ciinfo.isCI) {
        telemetry == null ? void 0 : telemetry.record(policyEvent);
        return;
    }
    // An agent's stopped command sends policy and nudge together before synchronous exit.
    const agent = isTerminalForcedForTesting() ? null : await (0, _agentname.getAgentName)();
    if (!agent) {
        telemetry == null ? void 0 : telemetry.record(policyEvent);
    }
    const installedVersion = "16.4.5" || 'unknown';
    let stopBefore = null;
    if (!agent) {
        if (!signal || signal.aborted) {
            return;
        }
        if (!canPromptForUpgrade()) {
            return;
        }
        if (!requested) {
            stopBefore = await getUpgradeDismissal(directory, installedVersion, policy);
        }
        if (signal.aborted) {
            return;
        }
    }
    const reminder = await (stopBefore === null && initialAssessment && !isTerminalForcedForTesting() ? initialAssessment : assessUpgrade(directory, {
        ...config,
        experimental: {
            agentUpgrade: policy
        }
    }, installedVersion, stopBefore, requested !== null)).catch((error)=>{
        if (agent) {
            telemetry == null ? void 0 : telemetry.record(policyEvent);
        }
        throw error;
    });
    if (!reminder || (signal == null ? void 0 : signal.aborted)) {
        if (agent) {
            telemetry == null ? void 0 : telemetry.record(policyEvent);
        }
        return;
    }
    // The nudge and any resulting upgrade run share this ID across processes.
    const nudgeId = (0, _crypto.randomUUID)();
    if (agent) {
        await nudgeUpgradeForAgent({
            directory,
            distDir: config.distDir,
            command
        }, reminder, nudgeId, agent, telemetry, policyEvent);
    } else if (signal) {
        // Count a human nudge only after the menu renders, including its selected action.
        let shown = false;
        const onShown = telemetryOptions ? ()=>{
            shown = true;
            telemetryOptions.onNudgeId == null ? void 0 : telemetryOptions.onNudgeId.call(telemetryOptions, nudgeId);
            telemetryOptions.telemetry.record((0, _agentupgrade.eventAgentUpgradeNudgeShown)({
                nudgeId,
                recipient: 'human',
                agentProduct: null,
                sourceCommand: command,
                policy: reminder.policy,
                nudgeKind: reminder.kind
            }));
        } : null;
        const action = await nudgeUpgradeForHuman(directory, reminder, signal, onShown);
        // The caller flushes after it gives the terminal back.
        if (shown && telemetry && !signal.aborted) {
            telemetry.record((0, _agentupgrade.eventAgentUpgradeNudgeDecision)({
                nudgeId,
                action
            }));
        }
        return action;
    }
}

//# sourceMappingURL=nudge.js.map