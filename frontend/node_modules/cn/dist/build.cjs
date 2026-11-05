Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_build = require('./build2.cjs');

exports.build = require_build.build;
exports.createBuilder = require_build.createBuilder;
exports.createContentMatcher = require_build.createContentMatcher;
exports.expandGlobs = require_build.expandGlobs;
exports.extractTokens = require_build.extractTokens;