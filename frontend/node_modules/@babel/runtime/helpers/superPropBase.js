var getPrototypeOf = require("./getPrototypeOf.js");
function _superPropBase(o, t) {
  for (; !{}.hasOwnProperty.call(o, t) && null !== (o = getPrototypeOf(o)););
  return o;
}
module.exports = _superPropBase, module.exports.__esModule = true, module.exports["default"] = module.exports;