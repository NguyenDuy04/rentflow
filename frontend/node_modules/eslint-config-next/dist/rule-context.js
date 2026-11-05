"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fixupPluginRules", {
    enumerable: true,
    get: function() {
        return fixupPluginRules;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var patchedRules = new WeakSet();
function fixupPluginRules(plugin) {
    var _plugin_rules;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        var _loop = function() {
            var rule = _step.value;
            if ((typeof rule === "undefined" ? "undefined" : _type_of(rule)) !== 'object' || patchedRules.has(rule)) return "continue";
            patchedRules.add(rule);
            var create = rule.create;
            rule.create = function(context) {
                return create.call(this, fixupRuleContext(context));
            };
        };
        for(var _iterator = Object.values((_plugin_rules = plugin.rules) !== null && _plugin_rules !== void 0 ? _plugin_rules : {})[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
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
    return plugin;
}
function fixupRuleContext(context) {
    if (typeof context.getFilename === 'function') return context;
    // The context is frozen, so extend it the same way ESLint does internally.
    return Object.freeze(Object.create(context, {
        getCwd: {
            value: function() {
                return context.cwd;
            }
        },
        getFilename: {
            value: function() {
                return context.filename;
            }
        },
        getPhysicalFilename: {
            value: function() {
                return context.physicalFilename;
            }
        },
        getSourceCode: {
            value: function() {
                return context.sourceCode;
            }
        },
        // Same values ESLint 9 provides for flat config.
        parserOptions: {
            value: _object_spread({}, context.languageOptions.parserOptions)
        },
        parserPath: {
            value: undefined
        }
    }));
}
