"use strict";
var _eslintparser = require("next/dist/compiled/babel/eslint-parser");
var _packagejson = require("../package.json");
/**
 * ESLint 10 no longer adds configured and inline (`/* global *\/`) globals to
 * the scope itself. It calls `scopeManager.addGlobals()` instead, which the
 * eslint-scope@5 based scope manager of @babel/eslint-parser@7 doesn't have.
 * This adds it, doing the same scope maintenance ESLint 9 did.
 */ function addGlobalsSupport(scopeManager) {
    var globalScope = scopeManager.globalScope;
    if (!globalScope || typeof globalScope.__defineGeneric !== 'function') return;
    scopeManager.addGlobals = function(names) {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var name = _step.value;
                globalScope.__defineGeneric(name, globalScope.set, globalScope.variables, null, null);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
        // Resolve references to any global variable, not only the added ones:
        // eslint-scope@5 also leaves references to top-level `var` declarations in
        // scripts unresolved, which ESLint 9 resolved here as well.
        globalScope.through = globalScope.through.filter(function(reference) {
            var variable = globalScope.set.get(reference.identifier.name);
            if (!variable) return true;
            reference.resolved = variable;
            variable.references.push(reference);
            return false;
        });
        // Assignments to globals in non-strict code aren't implicit globals.
        var implicit = globalScope.implicit;
        if (implicit) {
            var _implicit_left;
            implicit.variables = implicit.variables.filter(function(variable) {
                if (!globalScope.set.has(variable.name)) return true;
                implicit.set.delete(variable.name);
                return false;
            });
            implicit.left = (_implicit_left = implicit.left) === null || _implicit_left === void 0 ? void 0 : _implicit_left.filter(function(reference) {
                return !globalScope.set.has(reference.identifier.name);
            });
        }
    };
}
var parser = {
    parse: _eslintparser.parse,
    parseForESLint: function parseForESLint(code, options) {
        var result = (0, _eslintparser.parseForESLint)(code, options);
        var scopeManager = result.scopeManager;
        if (scopeManager && typeof scopeManager.addGlobals !== 'function') {
            addGlobalsSupport(scopeManager);
        }
        return result;
    },
    meta: {
        name: 'eslint-config-next/parser',
        version: _packagejson.version
    }
};
module.exports = parser;
