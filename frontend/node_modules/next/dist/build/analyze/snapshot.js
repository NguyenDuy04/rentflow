"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    historyIndexSchema: null,
    readAnalyzeRoutes: null,
    snapshotDirectory: null,
    snapshotMetadataSchema: null,
    snapshotNameSchema: null,
    writeAnalyzeSnapshot: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    historyIndexSchema: function() {
        return historyIndexSchema;
    },
    readAnalyzeRoutes: function() {
        return readAnalyzeRoutes;
    },
    snapshotDirectory: function() {
        return snapshotDirectory;
    },
    snapshotMetadataSchema: function() {
        return snapshotMetadataSchema;
    },
    snapshotNameSchema: function() {
        return snapshotNameSchema;
    },
    writeAnalyzeSnapshot: function() {
        return writeAnalyzeSnapshot;
    }
});
const _nodepath = /*#__PURE__*/ _interop_require_wildcard(require("node:path"));
const _nodefs = require("node:fs");
const _zod = require("next/dist/compiled/zod");
const _git = require("../../lib/helpers/git");
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
const MAX_HISTORY = 20;
const snapshotNameSchema = _zod.z.string().min(1).refine((name)=>{
    try {
        encodeURIComponent(name);
        return true;
    } catch  {
        return false;
    }
}, 'Invalid analyzer snapshot name');
const snapshotMetadataSchema = _zod.z.object({
    name: snapshotNameSchema,
    createdAt: _zod.z.string().datetime(),
    nextVersion: _zod.z.string().optional(),
    gitBranch: _zod.z.string().optional(),
    gitSha: _zod.z.string().optional(),
    gitShortSha: _zod.z.string().optional(),
    gitDirty: _zod.z.boolean().optional(),
    gitMessage: _zod.z.string().optional(),
    appDirOnly: _zod.z.boolean().optional(),
    noMangling: _zod.z.boolean().optional(),
    routeCount: _zod.z.number().int().nonnegative()
});
const historyIndexSchema = _zod.z.object({
    snapshots: _zod.z.array(snapshotMetadataSchema)
});
function snapshotDirectory(name) {
    return `snapshot-${encodeURIComponent(snapshotNameSchema.parse(name))}`;
}
const DATA_DIRNAME = 'data';
const HISTORY_DIRNAME = 'history';
const METADATA_FILENAME = 'metadata.json';
const HISTORY_INDEX_FILENAME = 'history.json';
const ROUTE_SUMMARIES_FILENAME = 'route-summaries.json';
const routeSummariesSchema = _zod.z.array(_zod.z.object({
    route: _zod.z.string()
}));
function readAnalyzeRoutes(directory) {
    const summariesFile = _nodepath.join(directory, ROUTE_SUMMARIES_FILENAME);
    try {
        return routeSummariesSchema.parse(JSON.parse((0, _nodefs.readFileSync)(summariesFile, 'utf8'))).map(({ route })=>route);
    } catch (error) {
        throw new Error(`Failed to read analyzer route summaries from ${summariesFile}. The analysis may be from an older Next.js version or incomplete; re-run \`next analyze\` to capture it again.`, {
            cause: error
        });
    }
}
function writeAnalyzeSnapshot({ projectDir, analyzeDir, routes, appDirOnly, noMangling, snapshot, maxHistory = MAX_HISTORY }) {
    const dataDir = _nodepath.join(analyzeDir, DATA_DIRNAME);
    const historyDir = _nodepath.join(analyzeDir, HISTORY_DIRNAME);
    const createdAt = new Date();
    (0, _nodefs.mkdirSync)(historyDir, {
        recursive: true
    });
    let name;
    let snapshotDir;
    if (snapshot !== undefined) {
        name = snapshotNameSchema.parse(snapshot);
        snapshotDir = _nodepath.join(historyDir, snapshotDirectory(name));
        // Replacement must not merge stale files from the previous capture.
        (0, _nodefs.rmSync)(snapshotDir, {
            recursive: true,
            force: true,
            maxRetries: 3
        });
        (0, _nodefs.mkdirSync)(snapshotDir);
    } else {
        const timestamp = createdAt.toISOString().replace(/[:.]/g, '-');
        for(let attempt = 0;; attempt++){
            name = attempt === 0 ? timestamp : `${timestamp}-${attempt}`;
            snapshotDir = _nodepath.join(historyDir, snapshotDirectory(name));
            try {
                // Exclusive reservation prevents timestamp collisions from overwriting data.
                (0, _nodefs.mkdirSync)(snapshotDir);
                break;
            } catch (error) {
                if (error.code !== 'EEXIST') throw error;
            }
        }
    }
    const gitSha = (0, _git.getGitCommit)(projectDir);
    const metadata = {
        name,
        createdAt: createdAt.toISOString(),
        nextVersion: "16.4.5",
        gitBranch: (0, _git.getGitBranch)(projectDir),
        gitSha,
        gitShortSha: gitSha == null ? void 0 : gitSha.slice(0, 7),
        gitDirty: (0, _git.getGitDirty)(projectDir),
        gitMessage: (0, _git.getGitMessage)(projectDir),
        appDirOnly,
        noMangling,
        routeCount: routes.length
    };
    try {
        (0, _nodefs.writeFileSync)(_nodepath.join(dataDir, METADATA_FILENAME), JSON.stringify(metadata, null, 2));
        (0, _nodefs.cpSync)(dataDir, snapshotDir, {
            recursive: true
        });
        rewriteHistoryIndex(historyDir, maxHistory, name);
        return metadata;
    } catch (error) {
        (0, _nodefs.rmSync)(snapshotDir, {
            recursive: true,
            force: true,
            maxRetries: 3
        });
        throw error;
    }
}
/** Read valid snapshot metadata, prune old captures, and rebuild the history index. */ function rewriteHistoryIndex(historyDir, maxHistory, currentName) {
    const snapshots = [];
    for (const entry of (0, _nodefs.readdirSync)(historyDir)){
        if (entry === HISTORY_INDEX_FILENAME) continue;
        try {
            const metadata = snapshotMetadataSchema.parse(JSON.parse((0, _nodefs.readFileSync)(_nodepath.join(historyDir, entry, METADATA_FILENAME), 'utf8')));
            if (entry === snapshotDirectory(metadata.name)) snapshots.push(metadata);
        } catch  {
        // Unreadable/non-snapshot directories are not part of the history index.
        }
    }
    snapshots.sort((a, b)=>b.createdAt.localeCompare(a.createdAt) || Number(b.name === currentName) - Number(a.name === currentName));
    for (const snapshot of snapshots.slice(maxHistory)){
        (0, _nodefs.rmSync)(_nodepath.join(historyDir, snapshotDirectory(snapshot.name)), {
            recursive: true,
            force: true,
            maxRetries: 3
        });
    }
    (0, _nodefs.writeFileSync)(_nodepath.join(historyDir, HISTORY_INDEX_FILENAME), JSON.stringify({
        snapshots: snapshots.slice(0, maxHistory)
    }, null, 2));
}

//# sourceMappingURL=snapshot.js.map