"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    reportAgentUpgradeAgentResult: null,
    spawnNextUpgrade: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    reportAgentUpgradeAgentResult: function() {
        return reportAgentUpgradeAgentResult;
    },
    spawnNextUpgrade: function() {
        return spawnNextUpgrade;
    }
});
const _child_process = require("child_process");
const _crypto = require("crypto");
const _promises = require("fs/promises");
const _os = require("os");
const _path = require("path");
const _semver = require("next/dist/compiled/semver");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../build/output/log"));
const _spinner = /*#__PURE__*/ _interop_require_default(require("../build/spinner"));
const _findpagesdir = require("../lib/find-pages-dir");
const _getprojectdir = require("../lib/get-project-dir");
const _warnmissingreactdependencies = require("../lib/warn-missing-react-dependencies");
const _getnpxcommand = require("../lib/helpers/get-npx-command");
const _interopdefault = require("../lib/interop-default");
const _picocolors = require("../lib/picocolors");
const _runchildprocess = require("../lib/upgrade/run-child-process");
const _agentname = require("../telemetry/agent-name");
const _agentupgrade = require("../telemetry/events/agent-upgrade");
const _storage = require("../telemetry/storage");
const _config = /*#__PURE__*/ _interop_require_default(require("../server/config"));
const _configshared = require("../server/config-shared");
const _constants = require("../shared/lib/constants");
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
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODEMOD_COMMAND_PLACEHOLDER = '<codemod-command>';
const SKILLS_CLI_VERSION = '1.5.26';
async function prepareUpgradeDocument(input) {
    if (input.document.startsWith('docs/')) {
        const path = input.document.slice('docs/'.length);
        const destination = (0, _path.join)(input.runDirectory, input.document);
        await (0, _promises.mkdir)((0, _path.dirname)(destination), {
            recursive: true
        });
        await (0, _promises.cp)((0, _path.join)(input.bundledDocs, path), destination);
        return destination;
    }
    const match = /^skills\/(.+)\/SKILL\.md$/.exec(input.document);
    if (!match) {
        throw new Error(`Unsupported upgrade document ${input.document}.`);
    }
    return prepareUpgradeSkill(input, match[1]);
}
async function prepareUpgradeSkill(input, skill) {
    const spawnCommand = require('next/dist/compiled/cross-spawn');
    const [command, ...runnerArgs] = (0, _getnpxcommand.getNpxCommand)(input.directory).split(' ');
    const source = `https://github.com/vercel/next.js/tree/v${input.nextVersion}/skills/` + skill;
    const args = [
        ...runnerArgs,
        `skills@${SKILLS_CLI_VERSION}`,
        'use',
        source
    ];
    const skillDirectory = (0, _path.join)(input.runDirectory, 'skills', skill);
    const instructionsPath = (0, _path.join)(skillDirectory, 'PROMPT.md');
    await (0, _promises.mkdir)(skillDirectory, {
        recursive: true
    });
    try {
        const instructions = await new Promise((resolve, reject)=>{
            var _child_stdout, _child_stderr, _child_stdout1, _child_stderr1;
            const child = spawnCommand(command, args, {
                cwd: input.directory,
                env: {
                    ...process.env,
                    TEMP: skillDirectory,
                    TMP: skillDirectory,
                    TMPDIR: skillDirectory
                },
                stdio: [
                    'ignore',
                    'pipe',
                    'pipe'
                ]
            });
            let stdout = '';
            let stderr = '';
            (_child_stdout = child.stdout) == null ? void 0 : _child_stdout.setEncoding('utf8');
            (_child_stderr = child.stderr) == null ? void 0 : _child_stderr.setEncoding('utf8');
            (_child_stdout1 = child.stdout) == null ? void 0 : _child_stdout1.on('data', (chunk)=>{
                stdout += chunk;
            });
            (_child_stderr1 = child.stderr) == null ? void 0 : _child_stderr1.on('data', (chunk)=>{
                stderr += chunk;
            });
            child.once('error', reject);
            child.once('close', (code)=>{
                if (code !== 0) {
                    reject(new Error(`Could not prepare ${input.document}: ${stderr.trim() || `exit code ${code ?? 'unknown'}`}`));
                    return;
                }
                if (!stdout.trim()) {
                    reject(new Error(`${input.document} returned no instructions.`));
                    return;
                }
                resolve(stdout);
            });
        });
        await (0, _promises.writeFile)(instructionsPath, instructions);
        return instructionsPath;
    } catch (error) {
        await (0, _promises.rm)(skillDirectory, {
            recursive: true,
            force: true
        });
        throw error;
    }
}
async function loadAgentUpgradeConfig(directory) {
    // Read and normalize the app's config without validating legacy options
    // against the current Next.js schema.
    const rawConfig = await (0, _config.default)(_constants.PHASE_PRODUCTION_BUILD, directory, {
        rawConfig: true
    });
    return (0, _configshared.normalizeConfig)(_constants.PHASE_PRODUCTION_BUILD, (0, _interopdefault.interopDefault)(rawConfig));
}
async function resolveCanaryVersion() {
    try {
        const response = await fetch('https://registry.npmjs.org/next/canary', {
            signal: AbortSignal.timeout(10000),
            cache: 'no-store',
            redirect: 'error'
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const { version } = await response.json();
        if (typeof version !== 'string' || (0, _semver.valid)(version) !== version) {
            throw new Error('Invalid canary version');
        }
        return version;
    } catch (error) {
        throw new Error('Could not fetch the latest Next.js canary from npm.', {
            cause: error
        });
    }
}
async function spawnNextUpgrade(directory, options, nudgeSource) {
    let baseDir = (0, _path.resolve)(directory || '.');
    if (options.agent) {
        // Match dev/build's telemetry storage, including custom output directories in CI.
        // Retain config errors until after recording the invocation so failed runs still count.
        let distDir = '.next';
        let configuredPolicy = null;
        let configError = null;
        try {
            var _config_experimental;
            baseDir = (0, _getprojectdir.getProjectDir)(directory, false);
            (0, _warnmissingreactdependencies.warnMissingReactDependencies)(baseDir);
            const config = await loadAgentUpgradeConfig(baseDir);
            distDir = config.distDir || '.next';
            configuredPolicy = (_config_experimental = config.experimental) == null ? void 0 : _config_experimental.agentUpgrade;
        } catch (error) {
            configError = error;
        }
        // Count agent invocations even when resolving the directory or config fails.
        const telemetry = new _storage.Telemetry({
            distDir: (0, _path.join)(baseDir, distDir),
            skipNotify: true
        });
        // The parent records attribution; canary only needs its run ID to report results.
        // Remove it before launching an agent so later upgrades start their own runs.
        const inheritedRunId = process.env.__NEXT_AGENT_UPGRADE_RUN_ID;
        delete process.env.__NEXT_AGENT_UPGRADE_RUN_ID;
        const invalidRunId = inheritedRunId !== undefined && !UUID_PATTERN.test(inheritedRunId);
        const invalidNudgeId = nudgeSource !== null && !UUID_PATTERN.test(nudgeSource.id);
        const runId = inheritedRunId && !invalidRunId ? inheritedRunId : (0, _crypto.randomUUID)();
        let resolvedPolicy = null;
        let failureStage = 'cli';
        let cliResultRecorded = false;
        // Preparation and handoff can both fail; record only the first terminal result.
        const recordCLIResult = (result, handoffMethod, selectedAgentProduct)=>{
            if (cliResultRecorded) {
                return;
            }
            cliResultRecorded = true;
            telemetry.record((0, _agentupgrade.eventAgentUpgradeCLIResult)({
                runId,
                result,
                resolvedPolicy,
                handoffMethod,
                selectedAgentProduct
            }));
        };
        try {
            var _prerelease;
            // Only the original invocation records a start, including invalid-input failures.
            // Origin and nudge attribution stay on that event; results join through runId.
            if (!inheritedRunId || invalidRunId) {
                const agentProduct = await (0, _agentname.getAgentName)();
                const nudge = invalidRunId || invalidNudgeId ? null : nudgeSource;
                const origin = nudge ? nudge.recipient === 'agent' ? 'agent_nudge' : 'human_nudge' : agentProduct ? 'agent_manual' : 'human_manual';
                telemetry.record((0, _agentupgrade.eventAgentUpgradeRunStarted)({
                    runId,
                    nudgeId: (nudge == null ? void 0 : nudge.id) ?? null,
                    origin,
                    agentProduct,
                    requestedPolicy: options.agent === 'security' || options.agent === 'latest' || options.agent === 'experimental-future' ? options.agent : null
                }));
            }
            if (invalidRunId) {
                throw new Error('Invalid upgrade run ID.');
            }
            if (invalidNudgeId) {
                throw new Error('Invalid upgrade nudge ID.');
            }
            if (configError) {
                throw configError;
            }
            const expectedVersion = process.env.__NEXT_UPGRADE_EXPECTED_CLI_VERSION;
            delete process.env.__NEXT_UPGRADE_EXPECTED_CLI_VERSION;
            delete process.env.__NEXT_UPGRADE_USE_CURRENT_CLI;
            if (expectedVersion !== undefined) {
                // Delegated upgrades and evals use their pinned CLI without another lookup.
                if ("16.4.5" !== expectedVersion) {
                    throw new Error(`Expected Next.js ${expectedVersion} for the upgrade, but launched ${"16.4.5"}.`);
                }
            } else {
                _log.info((0, _picocolors.dim)('Preparing upgrade...'));
                failureStage = 'metadata';
                const canaryVersion = await resolveCanaryVersion();
                failureStage = 'cli';
                if ("16.4.5" !== canaryVersion) {
                    const [command, ...runnerArgs] = (0, _getnpxcommand.getNpxCommand)(baseDir).split(' ');
                    const agentArgument = typeof options.agent === 'string' ? `--agent=${options.agent}` : '--agent';
                    const args = [
                        ...runnerArgs,
                        `next@${canaryVersion}`,
                        'upgrade',
                        baseDir,
                        agentArgument
                    ];
                    if (options.verbose) {
                        args.push('--verbose');
                    }
                    process.exitCode = await (0, _runchildprocess.runChildProcess)(command, args, {
                        cwd: baseDir,
                        stdio: 'inherit',
                        env: {
                            ...process.env,
                            // The delegated CLI emits the CLI result for this invocation's run ID.
                            __NEXT_AGENT_UPGRADE_RUN_ID: runId,
                            __NEXT_UPGRADE_EXPECTED_CLI_VERSION: canaryVersion,
                            // Older canaries recognize only this recursion guard.
                            __NEXT_UPGRADE_USE_CURRENT_CLI: '1'
                        }
                    }, null);
                    return;
                }
            }
            // A workspace root must not launch an upgrade for an unspecified app.
            if (!(0, _findpagesdir.findDir)(baseDir, 'app') && !(0, _findpagesdir.findDir)(baseDir, 'pages')) {
                throw new Error('No Next.js app found in this directory. Run the command from an app directory or pass its path:\n\n' + `next upgrade [directory] --agent${typeof options.agent === 'string' ? `=${options.agent}` : ''}`);
            }
            const upgradeType = typeof options.agent === 'string' ? options.agent : configuredPolicy === 'security' || configuredPolicy === 'latest' || configuredPolicy === 'experimental-future' ? configuredPolicy : 'security';
            if (upgradeType !== 'security' && upgradeType !== 'latest' && upgradeType !== 'experimental-future') {
                throw new Error(`Unsupported agent upgrade type ${JSON.stringify(upgradeType)}. Expected "security", "latest", or "experimental-future".`);
            }
            resolvedPolicy = upgradeType;
            // Resolve the requested target before preparing an agent session.
            const { prepareUpgrade } = require('../lib/upgrade/prepare-upgrade');
            const assessmentSpinner = (0, _spinner.default)('Preparing upgrade');
            const result = await prepareUpgrade(baseDir, upgradeType).finally(()=>assessmentSpinner == null ? void 0 : assessmentSpinner.stop());
            // Expected assessment failures retain their status and stop before handoff.
            if (result.status === 'blocked' || result.status === 'unknown') {
                recordCLIResult(result.status === 'blocked' ? 'no_safe_target' : 'metadata_failure', null, null);
                _log.error('Could not prepare the upgrade:', result.reason);
                process.exitCode = 1;
                return;
            }
            if (result.status !== 'ready') {
                _log.info(result.reason);
                recordCLIResult('no_update_needed', null, null);
                return;
            }
            const needsVersionUpdate = result.installedVersion !== result.targetVersion;
            const crossesMajor = (0, _semver.major)(result.installedVersion) !== (0, _semver.major)(result.targetVersion);
            _log.info(needsVersionUpdate ? `Upgrade: Next.js ${result.installedVersion} → ${result.targetVersion}` : `Future Defaults: Next.js ${result.installedVersion}`);
            // Use the invoking CLI's guides, even when the app runs an older Next.js.
            // Retain them outside the app so dependency changes cannot remove them.
            failureStage = 'guide';
            const bundledDocs = (0, _path.join)(__dirname, '../docs');
            const bundledGuides = (0, _path.join)(__dirname, '../lib/upgrade');
            const runDirectory = await (0, _promises.mkdtemp)((0, _path.join)((0, _os.tmpdir)(), 'next-upgrade-'));
            const guideName = crossesMajor ? 'different-major' : needsVersionUpdate ? 'same-major' : 'future-defaults';
            const guideDirectory = 'upgrade';
            const sharedGuidePath = (0, _path.join)(runDirectory, guideDirectory, 'shared.md');
            const guidePath = (0, _path.join)(runDirectory, guideDirectory, `${guideName}.md`);
            const futureGuidePath = (0, _path.join)(runDirectory, guideDirectory, 'future-defaults.md');
            const guidesSpinner = (0, _spinner.default)('Preparing upgrade');
            try {
                await (0, _promises.mkdir)((0, _path.dirname)(guidePath), {
                    recursive: true
                });
                await (0, _promises.cp)((0, _path.join)(bundledGuides, 'shared.md'), sharedGuidePath);
                await (0, _promises.cp)((0, _path.join)(bundledGuides, `${guideName}.md`), guidePath);
                if (crossesMajor) {
                    await (0, _promises.mkdir)((0, _path.join)(runDirectory, 'docs/01-app/02-guides/upgrading'), {
                        recursive: true
                    });
                    await (0, _promises.cp)((0, _path.join)(bundledDocs, '01-app/02-guides/upgrading/codemods.md'), (0, _path.join)(runDirectory, 'docs/01-app/02-guides/upgrading/codemods.md'));
                    for(let version = (0, _semver.major)(result.installedVersion) + 1; version <= (0, _semver.major)(result.targetVersion); version++){
                        const router = version < 14 ? '02-pages' : '01-app';
                        const destination = (0, _path.join)(runDirectory, 'docs', router, '02-guides/upgrading', `version-${version}.md`);
                        await (0, _promises.mkdir)((0, _path.dirname)(destination), {
                            recursive: true
                        });
                        await (0, _promises.cp)((0, _path.join)(bundledDocs, router, '02-guides/upgrading', `version-${version}.md`), destination);
                    }
                    if ((0, _semver.major)(result.installedVersion) < 13) {
                        await (0, _promises.mkdir)((0, _path.join)(runDirectory, 'docs/02-pages/02-guides/upgrading'), {
                            recursive: true
                        });
                        await (0, _promises.cp)((0, _path.join)(bundledDocs, '02-pages/02-guides/upgrading/codemods.md'), (0, _path.join)(runDirectory, 'docs/02-pages/02-guides/upgrading/codemods.md'));
                    }
                }
                if (upgradeType === 'experimental-future' && needsVersionUpdate) {
                    await (0, _promises.cp)((0, _path.join)(bundledGuides, 'future-defaults.md'), futureGuidePath);
                }
                if (crossesMajor) {
                    const codemodVersion = "16.4.5";
                    if (!codemodVersion) {
                        throw new Error('Could not determine the @next/codemod version.');
                    }
                    const codemodCommand = `${(0, _getnpxcommand.getNpxCommand)(baseDir)} @next/codemod@${codemodVersion} upgrade ${result.targetVersion} --yes --skip-adoption${options.verbose ? ' --verbose' : ''}`;
                    const guide = await (0, _promises.readFile)(guidePath, 'utf8');
                    if (!guide.includes(CODEMOD_COMMAND_PLACEHOLDER)) {
                        throw new Error('Could not prepare the upgrade guide.');
                    }
                    await (0, _promises.writeFile)(guidePath, guide.replace(CODEMOD_COMMAND_PLACEHOLDER, codemodCommand));
                }
            } catch (error) {
                await (0, _promises.rm)(runDirectory, {
                    recursive: true,
                    force: true
                });
                throw error;
            } finally{
                guidesSpinner == null ? void 0 : guidesSpinner.stop();
            }
            const preparedFutureDefaults = [];
            if (result.futureDefaults.length > 0) {
                const contextSpinner = (0, _spinner.default)('Preparing upgrade context');
                try {
                    for (const futureDefault of result.futureDefaults){
                        const documents = [];
                        for (const document of futureDefault.adoptionDoc){
                            try {
                                documents.push(await prepareUpgradeDocument({
                                    directory: baseDir,
                                    runDirectory,
                                    bundledDocs,
                                    nextVersion: result.targetVersion,
                                    document
                                }));
                            } catch  {
                                _log.warn(`Could not prepare upgrade document ${document}.`);
                            }
                        }
                        if (documents.length === 0) {
                            throw new Error(`Could not prepare adoption documents for ${futureDefault.name}.`);
                        }
                        preparedFutureDefaults.push({
                            ...futureDefault,
                            documents
                        });
                    }
                } finally{
                    contextSpinner == null ? void 0 : contextSpinner.stop();
                }
            }
            const references = result.references.map((reference)=>`- ${reference}`).join('\n');
            const releaseKind = ((_prerelease = (0, _semver.prerelease)(result.targetVersion)) == null ? void 0 : _prerelease[0]) ?? 'stable';
            const reason = upgradeType === 'security' ? 'the installed version is affected by a published security advisory' : upgradeType === 'latest' ? `a newer ${releaseKind} Next.js release is available` : `the Future policy applies the latest ${releaseKind} release${preparedFutureDefaults.length > 0 ? ' and adopts its Future Defaults' : ''}`;
            const futureDefaultsList = preparedFutureDefaults.map((futureDefault)=>`- ${futureDefault.name}\n${futureDefault.documents.map((document)=>`  - Read and follow ${JSON.stringify(document)}.`).join('\n')}`).join('\n');
            const futureDefaultsPrompt = upgradeType === 'experimental-future' ? `${needsVersionUpdate ? `After completing and verifying the version update, read and follow ${JSON.stringify(futureGuidePath)}.\n` : ''}${futureDefaultsList ? `Adopt these Future Defaults in order:\n${futureDefaultsList}\nComplete each adoption. Temporary opt-outs and TODO markers are intermediate work only; do not stop until they are removed and the adoption is fully verified.` : 'No Future Defaults are pending adoption.'}` : '';
            // Pass resolved inputs directly; the agent owns repairs and verification.
            const taskSummary = needsVersionUpdate ? `We're upgrading the app in ${JSON.stringify(baseDir)} from Next.js ${result.installedVersion} to ${result.targetVersion} because ${reason}.` : `We're adopting the Future Defaults available to the app in ${JSON.stringify(baseDir)}, which already uses Next.js ${result.installedVersion}.`;
            // Use the invoking CLI's reporter even after the app's Next.js package changes.
            const reportCommand = `${(0, _getnpxcommand.getNpxCommand)(baseDir)} next@${"16.4.5"} internal report-agent-upgrade ${runId}`;
            const prompt = (useWorktree)=>`Read and follow ${JSON.stringify(sharedGuidePath)} first. Attempt its applicable duplicate checks before changing files. If a check is unavailable, report it and continue. Stop only if you find equivalent work. Then read and follow every applicable instruction in ${JSON.stringify(guidePath)}.

${taskSummary}

${useWorktree === null ? "Follow the user's worktree choice. If they do not specify, use a separate Git worktree when the app is in a Git repository. Run upgrade commands from this app's corresponding directory in that worktree. If the app is not in a Git repository, upgrade it in place." : useWorktree ? "If the app is in a Git repository, perform the upgrade in a separate Git worktree. Run upgrade commands from this app's corresponding directory in that worktree. If the app is not in a Git repository, upgrade it in place." : 'Perform the upgrade in the current checkout.'}

Set \`experimental.agentUpgrade\` to ${JSON.stringify(upgradeType)} in the app's Next.js config as part of this upgrade. Preserve unrelated configuration. If the target Next.js version does not support this option, skip the setting and report why.

${futureDefaultsPrompt ? `${futureDefaultsPrompt.trimStart()}\n\n` : ''}References:
${references}

When this task ends, report its result once. After completing the requested upgrade and all applicable verification, run \`${reportCommand} success\`. If the attempted upgrade remains unsuccessful after repairs or verification fails, run \`${reportCommand} failure\`. If you stop for duplicate work, user cancellation, or an unavailable prerequisite, do not report success or failure. Explain the result to the user separately; never include project details or error text in the telemetry command.`;
            const { handoffUpgrade } = require('../lib/upgrade/harness');
            // Delivery is observable here; completing the upgrade belongs to the agent.
            failureStage = 'handoff';
            const handoffResult = await handoffUpgrade(prompt, baseDir, (method, selectedAgentProduct)=>{
                recordCLIResult('handoff_issued', method, selectedAgentProduct);
            });
            if (handoffResult === 'cancelled') {
                recordCLIResult('cancelled', null, null);
            } else if (handoffResult === 'failed') {
                recordCLIResult('handoff_failed', null, null);
            }
        } catch (error) {
            // Report the failed preparation stage while preserving the original error below.
            switch(failureStage){
                case 'metadata':
                    recordCLIResult('metadata_failure', null, null);
                    break;
                case 'guide':
                    recordCLIResult('guide_failure', null, null);
                    break;
                case 'handoff':
                    recordCLIResult('handoff_failed', null, null);
                    break;
                case 'cli':
                    recordCLIResult('cli_failure', null, null);
                    break;
            }
            _log.error('Could not prepare the upgrade:', error instanceof Error ? error.message : error);
            process.exitCode = 1;
        } finally{
            // Send queued results before this short-lived CLI invocation exits.
            await telemetry.flush();
        }
        return;
    }
    baseDir = (0, _getprojectdir.getProjectDir)(directory);
    (0, _warnmissingreactdependencies.warnMissingReactDependencies)(baseDir);
    const [upgradeProcessCommand, ...upgradeProcessDefaultArgs] = (0, _getnpxcommand.getNpxCommand)(baseDir).split(' ');
    const upgradeProcessCommandArgs = [
        ...upgradeProcessDefaultArgs,
        // Needs to be bleeding edge (canary) to pick up latest codemods.
        '@next/codemod@canary',
        'upgrade',
        options.revision
    ];
    if (options.verbose) {
        upgradeProcessCommandArgs.push('--verbose');
    }
    const upgradeProcess = (0, _child_process.spawn)(upgradeProcessCommand, upgradeProcessCommandArgs, {
        stdio: 'inherit',
        cwd: baseDir
    });
    upgradeProcess.on('close', (code)=>{
        process.exitCode = code ?? 0;
    });
}
async function reportAgentUpgradeAgentResult(runId, result) {
    // Only accept the bounded result and run ID; project details never enter this event.
    if (!UUID_PATTERN.test(runId) || result !== 'success' && result !== 'failure') {
        throw new Error('Expected an upgrade run UUID and a success or failure result.');
    }
    // Reuse normal telemetry consent and delivery without starting another upgrade.
    const config = await loadAgentUpgradeConfig(process.cwd());
    const telemetry = new _storage.Telemetry({
        distDir: (0, _path.join)(process.cwd(), config.distDir || '.next'),
        skipNotify: true
    });
    await telemetry.record((0, _agentupgrade.eventAgentUpgradeAgentResult)({
        runId,
        result
    }));
    await telemetry.flush();
}

//# sourceMappingURL=next-upgrade.js.map