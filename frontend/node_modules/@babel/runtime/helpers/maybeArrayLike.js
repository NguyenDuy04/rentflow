var arrayLikeToArray = require("./arrayLikeToArray.js");
function _maybeArrayLike(e, a, t) {
  if (a && !Array.isArray(a) && "number" == typeof a.length) {
    var i = a.length;
    return arrayLikeToArray(a, void 0 !== t && t < i ? t : i);
  }
  return e(a, t);
}
module.exports = _maybeArrayLike, module.exports.__esModule = true, module.exports["default"] = module.exports;