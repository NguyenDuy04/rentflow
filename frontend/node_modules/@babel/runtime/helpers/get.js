var superPropBase = require("./superPropBase.js");
function _get() {
  return module.exports = _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (t, r, n) {
    var l = superPropBase(t, r);
    if (l) {
      var f = Object.getOwnPropertyDescriptor(l, r);
      return f.get ? f.get.call(arguments.length < 3 ? t : n) : f.value;
    }
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _get.apply(null, arguments);
}
module.exports = _get, module.exports.__esModule = true, module.exports["default"] = module.exports;