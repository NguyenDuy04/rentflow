import semver from 'next/dist/compiled/semver';
import { findDir } from '../find-pages-dir';
export const futureDefaults = [
    // TODO: Add `partialPrefetching` after the Cache Components Future Default
    // workflow is proven end to end.
    {
        name: 'Cache Components',
        availableSince: '16.3.0',
        isAdopted: (config)=>config.cacheComponents === true,
        adoptionDoc: [
            'docs/01-app/02-guides/migrating-to-cache-components.md',
            'skills/next-cache-components-adoption/SKILL.md'
        ],
        optimizationDoc: [
            'skills/next-cache-components-optimizer/SKILL.md'
        ],
        // TODO: Support Pages -> App migration before offering adoption to Pages-only apps.
        isApplicable: (directory)=>findDir(directory, 'app') !== null
    }
];
export function getPendingFutureDefaults(directory, config, version) {
    var _semver_prerelease;
    if (!semver.valid(version) || semver.prerelease(version) && ((_semver_prerelease = semver.prerelease(version)) == null ? void 0 : _semver_prerelease[0]) !== 'canary') {
        return [];
    }
    return futureDefaults.filter((entry)=>semver.gte(version, entry.availableSince) && !entry.isAdopted(config) && entry.isApplicable(directory));
}

//# sourceMappingURL=future-defaults.js.map