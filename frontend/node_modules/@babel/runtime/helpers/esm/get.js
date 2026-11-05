import superPropBase from "./superPropBase.js";
function _get() {
  return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (t, r, n) {
    var l = superPropBase(t, r);
    if (l) {
      var f = Object.getOwnPropertyDescriptor(l, r);
      return f.get ? f.get.call(arguments.length < 3 ? t : n) : f.value;
    }
  }, _get.apply(null, arguments);
}
export { _get as default };