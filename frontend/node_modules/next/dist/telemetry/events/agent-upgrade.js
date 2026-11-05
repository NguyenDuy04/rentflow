// Shared values keep event payloads consistent across the CLI, nudges, and handoffs.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    eventAgentUpgradeAgentResult: null,
    eventAgentUpgradeCLIResult: null,
    eventAgentUpgradeNudgeDecision: null,
    eventAgentUpgradeNudgeShown: null,
    eventAgentUpgradePolicyDetected: null,
    eventAgentUpgradeRunStarted: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    eventAgentUpgradeAgentResult: function() {
        return eventAgentUpgradeAgentResult;
    },
    eventAgentUpgradeCLIResult: function() {
        return eventAgentUpgradeCLIResult;
    },
    eventAgentUpgradeNudgeDecision: function() {
        return eventAgentUpgradeNudgeDecision;
    },
    eventAgentUpgradeNudgeShown: function() {
        return eventAgentUpgradeNudgeShown;
    },
    eventAgentUpgradePolicyDetected: function() {
        return eventAgentUpgradePolicyDetected;
    },
    eventAgentUpgradeRunStarted: function() {
        return eventAgentUpgradeRunStarted;
    }
});
// Version every event so consumers can distinguish future schema changes.
function event(eventName, fields) {
    return {
        eventName,
        payload: {
            schemaVersion: 1,
            ...fields
        }
    };
}
function eventAgentUpgradePolicyDetected(fields) {
    return event('NEXT_AGENT_UPGRADE_POLICY_DETECTED', fields);
}
function eventAgentUpgradeNudgeShown(fields) {
    return event('NEXT_AGENT_UPGRADE_NUDGE_SHOWN', fields);
}
function eventAgentUpgradeNudgeDecision(fields) {
    return event('NEXT_AGENT_UPGRADE_NUDGE_DECISION', fields);
}
function eventAgentUpgradeRunStarted(fields) {
    return event('NEXT_AGENT_UPGRADE_RUN_STARTED', fields);
}
function eventAgentUpgradeCLIResult(fields) {
    return event('NEXT_AGENT_UPGRADE_CLI_RESULT', fields);
}
function eventAgentUpgradeAgentResult(fields) {
    return event('NEXT_AGENT_UPGRADE_AGENT_RESULT', fields);
}

//# sourceMappingURL=agent-upgrade.js.map