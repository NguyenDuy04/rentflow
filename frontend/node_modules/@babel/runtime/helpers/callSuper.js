var getPrototypeOf = require("./getPrototypeOf.js");
var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");
var possibleConstructorReturn = require("./possibleConstructorReturn.js");
function _callSuper(e, c, p) {
  return c = getPrototypeOf(c), possibleConstructorReturn(e, isNativeReflectConstruct() ? Reflect.construct(c, p || [], getPrototypeOf(e).constructor) : c.apply(e, p));
}
module.exports = _callSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;