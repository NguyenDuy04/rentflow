"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    agentFeedbackInstructionsCli: null,
    loadAgentFeedbackInstructions: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    agentFeedbackInstructionsCli: function() {
        return agentFeedbackInstructionsCli;
    },
    loadAgentFeedbackInstructions: function() {
        return loadAgentFeedbackInstructions;
    }
});
const _promises = require("fs/promises");
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _agentfeedbackstatus = require("./agent-feedback-status");
const _ciinfo = require("../../server/ci-info");
const _storage = require("../../telemetry/storage");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const AGENT_FEEDBACK_PROTOCOL_PATH = _path.default.join(__dirname, '../../agent-feedback/protocol.md');
const DRY_RUN_INSTRUCTIONS = `# Dry run

Use the protocol below to prepare each qualifying report draft and encode its review URL, but do not open a browser tab. Print each review URL for inspection instead. Do not clear the feedback candidate queue or mark the reporting pass complete.

`;
async function loadAgentFeedbackInstructions(options = {}, isEnabled = _agentfeedbackstatus.isAgentFeedbackEnabled, readProtocol = ()=>(0, _promises.readFile)(AGENT_FEEDBACK_PROTOCOL_PATH, 'utf8'), isLocallyEnabled = isAgentFeedbackLocallyEnabled) {
    if (!options.dryRun && (!isLocallyEnabled() || !await isEnabled())) {
        return null;
    }
    try {
        const protocol = await readProtocol();
        return options.dryRun ? `${DRY_RUN_INSTRUCTIONS}${protocol}` : protocol;
    } catch  {
        return null;
    }
}
function isAgentFeedbackLocallyEnabled() {
    if (_ciinfo.isCI) return false;
    return new _storage.Telemetry({
        distDir: _path.default.join(process.cwd(), '.next'),
        skipNotify: true
    }).isEnabled;
}
async function agentFeedbackInstructionsCli(options = {}, loadInstructions = loadAgentFeedbackInstructions) {
    try {
        const instructions = await loadInstructions(options);
        if (instructions) {
            process.stdout.write(instructions);
        }
    } catch  {
        process.stderr.write('Unable to check whether Next.js agent feedback is enabled. Rerun this command with network access.\n');
        process.exitCode = 1;
    }
}

//# sourceMappingURL=agent-feedback-instructions.js.map