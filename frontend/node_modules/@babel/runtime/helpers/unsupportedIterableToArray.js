var arrayLikeToArray = require("./arrayLikeToArray.js");
function _unsupportedIterableToArray(t, e) {
  if (t) {
    if ("string" == typeof t) return arrayLikeToArray(t, e);
    var o = {}.toString.call(t).slice(8, -1);
    return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? arrayLikeToArray(t, e) : void 0;
  }
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;