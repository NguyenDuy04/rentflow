"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createTurbopackBootstrapScriptStream: null,
    createTurbopackBootstrapScriptStreamForPage: null,
    getTurbopackBootstrapScriptTag: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createTurbopackBootstrapScriptStream: function() {
        return createTurbopackBootstrapScriptStream;
    },
    createTurbopackBootstrapScriptStreamForPage: function() {
        return createTurbopackBootstrapScriptStreamForPage;
    },
    getTurbopackBootstrapScriptTag: function() {
        return getTurbopackBootstrapScriptTag;
    }
});
const _htmlescape = require("../../shared/lib/htmlescape");
const _getpagefiles = require("../get-page-files");
const _nodewebstreamshelper = require("../stream-utils/node-web-streams-helper");
function getTurbopackBootstrapScriptTag(scriptContent, nonce) {
    const startScriptTag = nonce ? `<script nonce="${(0, _htmlescape.htmlEscapeAttributeString)(nonce)}">` : '<script>';
    // The bootstrap is `globalThis[<JSON string>].push(<JSON params>)`: the only
    // characters that need escaping can only appear inside its JSON string
    // literals, where the `\uXXXX` escapes keep their value.
    return `${startScriptTag}${(0, _htmlescape.htmlEscapeJsonString)(scriptContent)}</script>`;
}
function createTurbopackBootstrapScriptStream(scriptContent, nonce) {
    return (0, _nodewebstreamshelper.streamFromString)(getTurbopackBootstrapScriptTag(scriptContent, nonce));
}
function createTurbopackBootstrapScriptStreamForPage(buildManifest, page, nonce) {
    if (!buildManifest.pagesChunkGroupBootstrapParams || !buildManifest.chunkLoadingGlobal) {
        return undefined;
    }
    const scriptContent = (0, _getpagefiles.getTurbopackChunkGroupBootstrap)(buildManifest.pagesChunkGroupBootstrapParams, buildManifest.chunkLoadingGlobal, [
        page
    ]);
    return scriptContent ? createTurbopackBootstrapScriptStream(scriptContent, nonce) : undefined;
}

//# sourceMappingURL=turbopack-bootstrap-script.js.map