var getPrototypeOf = require("./getPrototypeOf.js");
var setPrototypeOf = require("./setPrototypeOf.js");
var isNativeFunction = require("./isNativeFunction.js");
var construct = require("./construct.js");
function _wrapNativeSuper(p) {
  var n = "function" == typeof Map ? new Map() : void 0;
  return module.exports = _wrapNativeSuper = function _wrapNativeSuper(p) {
    if (null === p || !isNativeFunction(p)) return p;
    if ("function" != typeof p) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== n) {
      if (n.has(p)) return n.get(p);
      n.set(p, Wrapper);
    }
    function Wrapper() {
      return construct(p, arguments, getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(p.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), setPrototypeOf(Wrapper, p);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _wrapNativeSuper(p);
}
module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;