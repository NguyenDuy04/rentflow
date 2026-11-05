var _typeof = require("./typeof.js")["default"];
var toPrimitive = require("./toPrimitive.js");
function toPropertyKey(r) {
  var o = toPrimitive(r, "string");
  return "symbol" == _typeof(o) ? o : o + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;