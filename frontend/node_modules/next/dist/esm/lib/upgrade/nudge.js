import { execFile } from 'child_process';
import { createHash, randomUUID } from 'crypto';
import { mkdir, readFile, realpath, rename, rm, writeFile } from 'fs/promises';
import { basename, dirname, join, relative, resolve } from 'path';
import { promisify } from 'util';
import { updateInitialEnv } from '@next/env';
import * as Log from '../../build/output/log';
import { eventAgentUpgradeNudgeDecision, eventAgentUpgradeNudgeShown, eventAgentUpgradePolicyDetected } from '../../telemetry/events/agent-upgrade';
import semver from 'next/dist/compiled/semver';
import { getAgentName } from '../../telemetry/agent-name';
import { getPendingFutureDefaults } from './future-defaults';
import { isCI } from '../../server/ci-info';
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
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
        await writeFile(temporary, JSON.stringify({
            issuedAt
        }), {
            mode: 384
        });
        await rename(temporary, path);
    } finally{
        await rm(temporary, {
            force: true
        });
    }
}
async function allowNudgeRetry({ directory, distDir, command }, version, kind) {
    const project = await realpath(directory);
    const identity = createHash('sha256').update(`${project}\0${version}\0${command}\0${kind}`).digest('hex');
    if (allowedRetries.has(identity)) {
        return true;
    }
    const cache = resolve(project, distDir, 'cache', 'next-agentic-upgrade-retries');
    const receipt = join(cache, `${identity}.json`);
    const claimed = `${receipt}.${randomUUID()}.claim`;
    await mkdir(cache, {
        recursive: true
    });
    try {
        await rename(receipt, claimed);
    } catch (error) {
        if (!hasCode(error, 'ENOENT')) {
            throw error;
        }
        await writeRetry(receipt, Date.now());
        return false;
    }
    let issuedAt;
    try {
        const value = JSON.parse(await readFile(claimed, 'utf8'));
        issuedAt = typeof value === 'object' && value !== null ? Reflect.get(value, 'issuedAt') : undefined;
    } catch  {
        issuedAt = undefined;
    } finally{
        await rm(claimed, {
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
export function getUpgradeContext(config) {
    return {
        distDir: config.distDir,
        cacheComponents: config.cacheComponents,
        configuredPolicy: config.experimental.agentUpgrade ?? null,
        experimental: {
            agentUpgrade: getRequestedUpgrade() ?? config.experimental.agentUpgrade ?? false
        }
    };
}
export async function assessUpgrade(directory, config, installedVersion = "16.4.5" || 'unknown', stopBefore = null, forceVersionReminder = false) {
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
    if (!semver.valid(installedVersion)) {
        return null;
    }
    const { getPrereleaseChannel, getUpgradeAssessment, getLatestUpgradeVersion } = require('./prepare-upgrade');
    if (semver.prerelease(installedVersion) && !getPrereleaseChannel(installedVersion)) {
        return null;
    }
    let assessment;
    try {
        assessment = await getUpgradeAssessment(installedVersion, policy, stopBefore === 'latest');
    } catch  {
        Log.warn('Could not check Next.js security advisories. Continuing without an upgrade assessment.');
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
            names: policy === 'experimental-future' ? getPendingFutureDefaults(directory, config, upgrade.targetVersion).map((entry)=>entry.name) : []
        };
    }
    if (policy !== 'experimental-future' || stopBefore === 'experimental-future') {
        return null;
    }
    const pending = getPendingFutureDefaults(directory, config, installedVersion);
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
            reference = `https://registry.npmjs.org/next/${((_semver_prerelease = semver.prerelease(reminder.installedVersion)) == null ? void 0 : _semver_prerelease[0]) === 'canary' ? 'canary' : 'latest'}`;
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
        Log.warn('Could not prepare an upgrade retry. This command will remain blocked.');
    }
    if (retryAllowed) {
        telemetry == null ? void 0 : telemetry.record(policyEvent);
        Log.warn(`${summary} This command is continuing after the upgrade reminder.${reference ? `\nReference: ${reference}` : ''}`);
        return;
    }
    // Queue the full nudge once, then send it outside the command that is about to stop.
    if (telemetry) {
        try {
            if (telemetry.isEnabled || process.env.NEXT_TELEMETRY_DEBUG) {
                telemetry.flushDetached({
                    mode: 'dev',
                    dir: options.directory,
                    distDir: resolve(options.directory, options.distDir),
                    events: [
                        policyEvent,
                        eventAgentUpgradeNudgeShown({
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
            Log.warn(`Could not queue upgrade telemetry: ${String(error)}`);
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
    const project = await realpath(directory);
    let identity = project;
    let projectName = basename(project);
    try {
        const { stdout } = await promisify(execFile)('git', [
            'rev-parse',
            '--show-toplevel',
            '--git-common-dir'
        ], {
            cwd: project,
            timeout: 1000
        });
        const [root, common] = stdout.trimEnd().split('\n');
        const commonDirectory = await realpath(resolve(project, common));
        const appPath = relative(await realpath(root), project);
        // Worktrees share a Git directory, but monorepo apps need separate keys.
        identity = `${commonDirectory}\0${appPath}`;
        projectName = basename(appPath || (basename(commonDirectory) === '.git' ? dirname(commonDirectory) : commonDirectory));
    } catch  {
    // Apps outside Git (or without Git installed) keep their directory identity.
    }
    const hash = createHash('sha256').update(identity).digest('hex');
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
    return (!isCI || isTerminalForcedForTesting()) && Boolean(process.stdin.isTTY && process.stdout.isTTY) && process.env.TERM !== 'dumb';
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
            Log.warn('Could not save your upgrade reminder preference. Skipping for this session.');
        }
    }
    return action;
}
export async function runUpgrade(directory, policy, nudgeId) {
    // The agent's dev/build commands must not trigger this explicit request again.
    delete process.env.__NEXT_AGENT_UPGRADE;
    updateInitialEnv({
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
export async function shouldPromptForUpgrade() {
    return canPromptForUpgrade() && (isTerminalForcedForTesting() || !await getAgentName());
}
export async function nudgeUpgrade(directory, config, command, signal, initialAssessment, telemetryOptions) {
    const requested = getRequestedUpgrade();
    const policy = requested ?? config.experimental.agentUpgrade;
    if (policy !== 'security' && policy !== 'latest' && policy !== 'experimental-future') {
        return;
    }
    // Observe the effective policy even when assessment finds no upgrade to offer.
    const telemetry = (telemetryOptions == null ? void 0 : telemetryOptions.telemetry) ?? null;
    const policyEvent = eventAgentUpgradePolicyDetected({
        configuredPolicy: config.configuredPolicy ?? null,
        effectivePolicy: policy,
        policySource: requested ? 'environment' : 'config',
        sourceCommand: command
    });
    if (requested && isCI) {
        telemetry == null ? void 0 : telemetry.record(policyEvent);
        return;
    }
    // An agent's stopped command sends policy and nudge together before synchronous exit.
    const agent = isTerminalForcedForTesting() ? null : await getAgentName();
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
    const nudgeId = randomUUID();
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
            telemetryOptions.telemetry.record(eventAgentUpgradeNudgeShown({
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
            telemetry.record(eventAgentUpgradeNudgeDecision({
                nudgeId,
                action
            }));
        }
        return action;
    }
}

//# sourceMappingURL=nudge.js.map