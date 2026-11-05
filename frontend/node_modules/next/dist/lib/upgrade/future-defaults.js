"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    futureDefaults: null,
    getPendingFutureDefaults: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    futureDefaults: function() {
        return futureDefaults;
    },
    getPendingFutureDefaults: function() {
        return getPendingFutureDefaults;
    }
});
const _semver = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/semver"));
const _findpagesdir = require("../find-pages-dir");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const futureDefaults = [
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
        isApplicable: (directory)=>(0, _findpagesdir.findDir)(directory, 'app') !== null
    }
];
function getPendingFutureDefaults(directory, config, version) {
    var _semver_prerelease;
    if (!_semver.default.valid(version) || _semver.default.prerelease(version) && ((_semver_prerelease = _semver.default.prerelease(version)) == null ? void 0 : _semver_prerelease[0]) !== 'canary') {
        return [];
    }
    return futureDefaults.filter((entry)=>_semver.default.gte(version, entry.availableSince) && !entry.isAdopted(config) && entry.isApplicable(directory));
}

//# sourceMappingURL=future-defaults.js.map