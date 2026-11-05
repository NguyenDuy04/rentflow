var set = require("./set.js");
var getPrototypeOf = require("./getPrototypeOf.js");
function _superPropSet(r, e, p, f, m, u) {
  return set(getPrototypeOf(u ? r.prototype : r), e, p, f, m);
}
module.exports = _superPropSet, module.exports.__esModule = true, module.exports["default"] = module.exports;