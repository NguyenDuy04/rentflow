"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getGitBranch: null,
    getGitCommit: null,
    getGitDirty: null,
    getGitMessage: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getGitBranch: function() {
        return getGitBranch;
    },
    getGitCommit: function() {
        return getGitCommit;
    },
    getGitDirty: function() {
        return getGitDirty;
    },
    getGitMessage: function() {
        return getGitMessage;
    }
});
const _nodechild_process = require("node:child_process");
function gitExec(args, cwd) {
    const result = (0, _nodechild_process.spawnSync)('git', args, {
        cwd,
        timeout: 2000,
        stdio: [
            'ignore',
            'pipe',
            'ignore'
        ],
        encoding: 'utf8'
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`git ${args[0]} exited with status ${result.status}`);
    }
    return result.stdout.trim();
}
function getGitBranch(cwd) {
    if (process.env.VERCEL_GIT_COMMIT_REF) {
        return process.env.VERCEL_GIT_COMMIT_REF;
    }
    try {
        // symbolic-ref --short HEAD: returns the branch name for regular branches,
        // works on repos with no commits, and exits non-zero in detached HEAD state
        // (caught below and treated as unknown).
        return gitExec([
            'symbolic-ref',
            '--short',
            'HEAD'
        ], cwd);
    } catch  {
        return undefined;
    }
}
function getGitCommit(cwd) {
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
        return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    try {
        return gitExec([
            'rev-parse',
            'HEAD'
        ], cwd);
    } catch  {
        return undefined;
    }
}
function getGitDirty(cwd) {
    try {
        return gitExec([
            'status',
            '--porcelain'
        ], cwd).length > 0;
    } catch  {
        return undefined;
    }
}
function getGitMessage(cwd) {
    if (process.env.VERCEL_GIT_COMMIT_MESSAGE) {
        return process.env.VERCEL_GIT_COMMIT_MESSAGE.split('\n')[0].trim();
    }
    try {
        return gitExec([
            'log',
            '-1',
            '--pretty=%s'
        ], cwd);
    } catch  {
        return undefined;
    }
}

//# sourceMappingURL=git.js.map