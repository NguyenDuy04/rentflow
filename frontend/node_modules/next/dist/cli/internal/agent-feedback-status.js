"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isAgentFeedbackEnabled", {
    enumerable: true,
    get: function() {
        return isAgentFeedbackEnabled;
    }
});
const AGENT_FEEDBACK_STATUS_URL = 'https://next-agent-feedback-gate.playground-vercel.tools/api/enabled';
async function isAgentFeedbackEnabled(fetchImpl = fetch, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(AGENT_FEEDBACK_STATUS_URL, {
            cache: 'no-store',
            signal: controller.signal
        });
        return response.ok && await response.text() === 'true';
    } finally{
        clearTimeout(timeout);
    }
}

//# sourceMappingURL=agent-feedback-status.js.map