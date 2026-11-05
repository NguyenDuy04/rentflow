"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getLatestUpgradeVersion: null,
    getPrereleaseChannel: null,
    getUpgradeAssessment: null,
    prepareUpgrade: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getLatestUpgradeVersion: function() {
        return getLatestUpgradeVersion;
    },
    getPrereleaseChannel: function() {
        return getPrereleaseChannel;
    },
    getUpgradeAssessment: function() {
        return getUpgradeAssessment;
    },
    prepareUpgrade: function() {
        return prepareUpgrade;
    }
});
const _promises = require("fs/promises");
const _module = require("module");
const _path = require("path");
const _env = require("@next/env");
const _semver = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/semver"));
const _config = /*#__PURE__*/ _interop_require_default(require("../../server/config"));
const _constants = require("../../shared/lib/constants");
const _futuredefaults = require("./future-defaults");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function prepareUpgrade(directory, targetRequest = 'security') {
    if (targetRequest !== 'security' && targetRequest !== 'latest' && targetRequest !== 'experimental-future') {
        throw new Error(`Unsupported agent upgrade type ${JSON.stringify(targetRequest)}. Expected "security", "latest", or "experimental-future".`);
    }
    // Resolve from the app: the invoking canary is only the upgrade tooling.
    const requireFromApp = (0, _module.createRequire)((0, _path.join)(directory, 'package.json'));
    const installedNext = JSON.parse(await (0, _promises.readFile)(requireFromApp.resolve('next/package.json'), 'utf8'));
    const installedVersion = installedNext.version;
    if (!_semver.default.valid(installedVersion)) {
        throw new Error('Could not determine the installed Next.js version.');
    }
    const { upgrade } = await getUpgradeAssessment(installedVersion, targetRequest);
    if (upgrade.status !== 'ready' || targetRequest !== 'experimental-future') {
        return upgrade;
    }
    const config = await (0, _config.default)(_constants.PHASE_INFO, directory, {
        silent: true
    }).finally(_env.resetEnv);
    const pendingFutureDefaults = (0, _futuredefaults.getPendingFutureDefaults)(directory, config, upgrade.targetVersion);
    if (upgrade.targetVersion === installedVersion && pendingFutureDefaults.length === 0) {
        return {
            status: 'unaffected',
            reason: `Next.js ${installedVersion} is current and no applicable Future Defaults are pending.`
        };
    }
    return {
        ...upgrade,
        futureDefaults: pendingFutureDefaults
    };
}
async function getUpgradeAssessment(installedVersion, policy, onlyIfAffected = false) {
    if (!_semver.default.valid(installedVersion)) {
        throw new Error('The running Next.js version is not valid semver.');
    }
    const channel = getPrereleaseChannel(installedVersion);
    if (_semver.default.prerelease(installedVersion) && !channel) {
        throw new Error('Agent upgrades are not available for this prerelease version of Next.js.');
    }
    if (channel && (policy === 'security' || onlyIfAffected)) {
        return {
            affected: null,
            reference: null,
            upgrade: {
                status: 'blocked',
                reason: `The installed Next.js version (${installedVersion}) is a ${channel} prerelease. Security advisories target stable versions, and prereleases do not reliably follow stable version ordering, so an advisory could be a false positive. To upgrade to the latest ${channel === 'canary' ? 'canary' : 'stable'} release, run this command from the app's directory:\n\nnpx next@canary upgrade --agent=latest`
            }
        };
    }
    if (channel && channel !== 'canary' && policy === 'experimental-future') {
        return {
            affected: null,
            reference: null,
            upgrade: {
                status: 'blocked',
                reason: `Future Defaults upgrades are not supported for Next.js ${installedVersion}. To upgrade to the latest stable release, run this command from the app's directory:\n\nnpx next@canary upgrade --agent=latest`
            }
        };
    }
    // Prerelease version ordering does not establish which security fixes it
    // contains, but stable promotion targets still need advisory validation.
    let snapshot = null;
    if (channel !== 'canary') {
        try {
            snapshot = {
                ranges: await readNpmAdvisories([
                    installedVersion
                ]),
                reference: NPM_ADVISORIES
            };
        } catch  {
            return {
                affected: null,
                reference: null,
                upgrade: {
                    status: 'unknown',
                    reason: 'Could not check for security updates. Please try again.'
                }
            };
        }
    }
    const affected = snapshot && !channel ? snapshot.ranges.some((range)=>_semver.default.satisfies(installedVersion, range)) : null;
    const assessment = {
        affected,
        reference: (snapshot == null ? void 0 : snapshot.reference) ?? null
    };
    // A dismissed release reminder still checks advisories, but does not need
    // target metadata unless an advisory applies.
    if ((policy === 'security' || onlyIfAffected) && !affected) {
        return {
            ...assessment,
            upgrade: {
                status: 'unaffected',
                reason: `No security update is needed for Next.js ${installedVersion}.`
            }
        };
    }
    // Keep a confirmed advisory even when target metadata cannot be read.
    try {
        let targetVersion;
        let references;
        if (policy === 'security' && snapshot) {
            const registryURL = `${NPM_REGISTRY}next`;
            const registry = (await fetchJSON(registryURL)).value;
            const releases = parseReleases(registry);
            references = [
                snapshot.reference,
                registryURL
            ];
            const candidates = securityCandidates(installedVersion, releases);
            const ranges = [
                ...snapshot.ranges,
                ...candidates.length ? await readNpmAdvisories(candidates.map(({ version })=>version)) : []
            ];
            try {
                targetVersion = selectSecurityTarget(installedVersion, releases, ranges).version;
            } catch (error) {
                return {
                    ...assessment,
                    upgrade: {
                        status: 'blocked',
                        reason: error.message
                    }
                };
            }
        } else {
            const release = await fetchLatestRelease(installedVersion);
            if (!release) {
                throw new Error(channel === 'canary' ? 'Could not determine the latest Next.js version on the canary dist-tag.' : 'Could not determine the latest stable Next.js version.');
            }
            targetVersion = policy === 'experimental-future' && _semver.default.gt(installedVersion, release.version) ? installedVersion : release.version;
            references = [
                release.reference
            ];
            const releaseKind = channel === 'canary' ? 'canary release' : 'stable release';
            if (policy === 'latest' && _semver.default.lt(targetVersion, installedVersion)) {
                return {
                    ...assessment,
                    upgrade: {
                        status: 'unaffected',
                        reason: `Next.js ${installedVersion} is newer than the latest ${releaseKind} ${targetVersion}.`
                    }
                };
            }
            const targetRanges = snapshot && targetVersion !== installedVersion ? await readNpmAdvisories([
                targetVersion
            ]) : snapshot == null ? void 0 : snapshot.ranges;
            if (targetRanges == null ? void 0 : targetRanges.some((range)=>_semver.default.satisfies(targetVersion, range))) {
                return {
                    ...assessment,
                    upgrade: {
                        status: 'blocked',
                        reason: `Next.js ${targetVersion} is affected by an active advisory.`
                    }
                };
            }
            if (policy === 'latest' && _semver.default.eq(targetVersion, installedVersion)) {
                return {
                    ...assessment,
                    upgrade: {
                        status: 'unaffected',
                        reason: `Next.js ${installedVersion} is already the latest ${releaseKind}.`
                    }
                };
            }
        }
        return {
            ...assessment,
            upgrade: {
                status: 'ready',
                installedVersion,
                targetVersion,
                references,
                futureDefaults: []
            }
        };
    } catch (error) {
        return {
            ...assessment,
            upgrade: {
                status: 'unknown',
                reason: error.message
            }
        };
    }
}
const NPM_REGISTRY = 'https://registry.npmjs.org/';
const NPM_ADVISORIES = `${NPM_REGISTRY}-/npm/v1/security/advisories/bulk`;
async function fetchJSON(url, init = undefined) {
    try {
        const response = await fetch(url, {
            ...init,
            headers: {
                Accept: 'application/json',
                ...init == null ? void 0 : init.headers
            },
            signal: AbortSignal.timeout(10000),
            redirect: 'error'
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return {
            value: await response.json()
        };
    } catch (error) {
        throw new Error('Could not fetch upgrade metadata. Please try again.', {
            cause: error
        });
    }
}
function getPrereleaseChannel(version) {
    var _semver_prerelease;
    const channel = (_semver_prerelease = _semver.default.prerelease(version)) == null ? void 0 : _semver_prerelease[0];
    return channel === 'canary' || channel === 'rc' || channel === 'beta' || channel === 'preview' ? channel : null;
}
function parseReleases(value) {
    const data = value;
    if (!(data == null ? void 0 : data.versions)) {
        throw new Error('Could not determine a safe Next.js version.');
    }
    return Object.entries(data.versions).flatMap(([version, metadata])=>{
        if (!_semver.default.valid(version) || _semver.default.prerelease(version)) {
            return [];
        }
        if (metadata.version !== version) {
            throw new Error('Could not determine a safe Next.js version.');
        }
        return [
            {
                version
            }
        ];
    });
}
function getLatestUpgradeVersion(version, targetVersion) {
    const channel = getPrereleaseChannel(version);
    const targetChannel = getPrereleaseChannel(targetVersion);
    if (!_semver.default.valid(version) || !_semver.default.valid(targetVersion) || _semver.default.prerelease(version) && !channel || _semver.default.prerelease(targetVersion) && !targetChannel || (channel === 'canary' ? targetChannel !== 'canary' : targetChannel !== null) || !_semver.default.gt(targetVersion, version)) {
        return null;
    }
    // Stable releases replacing prereleases still warrant a reminder, even
    // within the same minor. Patches and consecutive canaries remain explicit.
    if (!(channel && channel !== 'canary') && _semver.default.major(targetVersion) === _semver.default.major(version) && _semver.default.minor(targetVersion) === _semver.default.minor(version)) {
        return null;
    }
    return targetVersion;
}
async function fetchLatestRelease(installedVersion) {
    const channel = getPrereleaseChannel(installedVersion);
    const releaseChannel = channel === 'canary' ? 'canary' : 'latest';
    const reference = `${NPM_REGISTRY}next/${releaseChannel}`;
    const { value } = await fetchJSON(reference);
    const release = value;
    if (!release || !_semver.default.valid(release.version) || channel !== 'canary' && _semver.default.prerelease(release.version) || getPrereleaseChannel(release.version) !== (channel === 'canary' ? 'canary' : null)) {
        return null;
    }
    return {
        version: release.version,
        reference
    };
}
// TODO: Record whether each advisory lookup succeeded or failed in upgrade telemetry.
async function readNpmAdvisories(versions) {
    let value;
    try {
        value = (await fetchJSON(NPM_ADVISORIES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                next: versions
            })
        })).value;
    } catch (error) {
        throw new Error('Could not check for security updates. Please try again.', {
            cause: error
        });
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Could not check for security updates.');
    }
    const data = value;
    if (Object.keys(data).some((name)=>name !== 'next')) {
        throw new Error('Could not check for security updates.');
    }
    // The bulk endpoint omits packages with no known vulnerabilities.
    if (!('next' in data)) {
        return [];
    }
    if (!Array.isArray(data.next)) {
        throw new Error('Could not check for security updates.');
    }
    return data.next.map((finding)=>{
        if (!finding || typeof finding.vulnerable_versions !== 'string' || !finding.vulnerable_versions.trim()) {
            throw new Error('Could not check for security updates.');
        }
        const range = finding.vulnerable_versions.replace(/,\s*/g, ' ');
        if (!_semver.default.validRange(range)) {
            throw new Error('Could not check for security updates.');
        }
        return range;
    });
}
function securityCandidates(source, releases) {
    // Only the newest stable release of each eligible major is considered.
    const latest = new Map();
    for (const release of releases){
        const major = _semver.default.major(release.version);
        const previous = latest.get(major);
        if (!previous || _semver.default.gt(release.version, previous.version)) {
            latest.set(major, release);
        }
    }
    return [
        ...latest.entries()
    ].sort(([a], [b])=>a - b).filter(([major, release])=>major >= _semver.default.major(source) && _semver.default.gt(release.version, source)).map(([, release])=>release);
}
function selectSecurityTarget(source, releases, ranges) {
    if (!ranges.some((range)=>_semver.default.satisfies(source, range))) {
        return;
    }
    for (const candidate of securityCandidates(source, releases)){
        if (!ranges.some((range)=>_semver.default.satisfies(candidate.version, range))) {
            return candidate;
        }
    }
    throw new Error('No safe Next.js update is currently available.');
}

//# sourceMappingURL=prepare-upgrade.js.map