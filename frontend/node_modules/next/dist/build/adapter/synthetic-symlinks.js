"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    SyntheticSymlinkManager: null,
    createAdapterSyntheticSymlinkDirectory: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    SyntheticSymlinkManager: function() {
        return SyntheticSymlinkManager;
    },
    createAdapterSyntheticSymlinkDirectory: function() {
        return createAdapterSyntheticSymlinkDirectory;
    }
});
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class SyntheticSymlinkManager {
    constructor(stagingRoot){
        this.stagingRoot = stagingRoot;
        this.stagedLinkNames = new Set();
    }
    createLink(source, linkTarget, targetHash) {
        let targetType = 'file';
        // Keep 128 bits of entropy while shortening the path to avoid Windows'
        // 260-character path limit.
        let stagedName = targetHash.slice(0, 32);
        if (process.platform === 'win32') {
            try {
                targetType = _fs.default.statSync(source).isDirectory() ? 'dir' : 'file';
            } catch (error) {
                const code = error.code;
                // We cannot determine the target type, so just create a file symlink
                // ENOENT: Dangling link, preserve the dangling link as a file link
                // ELOOP: Unresolvable link cycle, preserve any part of the cycle that
                //        was traced
                if (code !== 'ENOENT' && code !== 'ELOOP') {
                    throw error;
                }
            }
            stagedName += `_${targetType}`;
        }
        const stagedPath = _path.default.join(this.stagingRoot, stagedName);
        if (!this.stagedLinkNames.has(stagedName)) {
            try {
                _fs.default.symlinkSync(linkTarget, stagedPath, targetType);
            } catch (error) {
                // This link may exist if `rmSync` (with `force: true`) failed to delete
                // some files (can happen on Windows), but it's content-addressed, so
                // we can safely ignore EEXIST.
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
            this.stagedLinkNames.add(stagedName);
        }
        return stagedPath;
    }
}
function createAdapterSyntheticSymlinkDirectory(distDir) {
    const stagingRoot = _path.default.join(distDir, 'adapter', 'synthetic_symlinks');
    _fs.default.rmSync(stagingRoot, {
        recursive: true,
        force: true,
        maxRetries: 3
    });
    _fs.default.mkdirSync(stagingRoot, {
        recursive: true
    });
    return new SyntheticSymlinkManager(stagingRoot);
}

//# sourceMappingURL=synthetic-symlinks.js.map