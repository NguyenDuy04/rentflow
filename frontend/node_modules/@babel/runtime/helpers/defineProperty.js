var toPropertyKey = require("./toPropertyKey.js");
function _defineProperty(r, t, o) {
  return (t = toPropertyKey(t)) in r ? Object.defineProperty(r, t, {
    value: o,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : r[t] = o, r;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;