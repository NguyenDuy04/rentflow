var get = require("./get.js");
var getPrototypeOf = require("./getPrototypeOf.js");
function _superPropGet(r, e, p, f) {
  var n = get(getPrototypeOf(1 & f ? r.prototype : r), e, p);
  return 2 & f && "function" == typeof n ? function (t) {
    return n.apply(p, t);
  } : n;
}
module.exports = _superPropGet, module.exports.__esModule = true, module.exports["default"] = module.exports;