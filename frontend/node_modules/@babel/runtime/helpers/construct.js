var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");
var setPrototypeOf = require("./setPrototypeOf.js");
function _construct(e, o, p) {
  if (isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var n = [null];
  n.push.apply(n, o);
  var l = new (e.bind.apply(e, n))();
  return p && setPrototypeOf(l, p.prototype), l;
}
module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;