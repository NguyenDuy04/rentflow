"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "serializeValidationErrorsToFlight", {
    enumerable: true,
    get: function() {
        return serializeValidationErrorsToFlight;
    }
});
const _streamops = require("./stream-ops");
const _manifestssingleton = require("./manifests-singleton");
const filterStackFrame = process.env.NODE_ENV !== 'production' ? require('../lib/source-maps').filterStackFrameDEV : undefined;
async function serializeValidationErrorsToFlight(componentMod, errors) {
    const { clientModules } = (0, _manifestssingleton.getClientReferenceManifest)();
    const stream = (0, _streamops.renderToNodeFlightStream)(componentMod, {
        errors
    }, clientModules, {
        filterStackFrame
    });
    const chunks = [];
    for await (const chunk of stream){
        chunks.push(chunk);
    }
    return chunks;
}

//# sourceMappingURL=dev-validation-error-delivery.js.map