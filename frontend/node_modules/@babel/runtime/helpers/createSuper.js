var getPrototypeOf = require("./getPrototypeOf.js");
var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");
var possibleConstructorReturn = require("./possibleConstructorReturn.js");
function _createSuper(o) {
  var i = isNativeReflectConstruct();
  return function () {
    var r,
      c = getPrototypeOf(o);
    if (i) {
      var n = getPrototypeOf(this).constructor;
      r = Reflect.construct(c, arguments, n);
    } else r = c.apply(this, arguments);
    return possibleConstructorReturn(this, r);
  };
}
module.exports = _createSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;