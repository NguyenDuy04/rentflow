var superPropBase = require("./superPropBase.js");
var defineProperty = require("./defineProperty.js");
function set(r, f, o, i) {
  return set = "undefined" != typeof Reflect && Reflect.set ? Reflect.set : function (r, f, o, i) {
    var n,
      p = superPropBase(r, f);
    if (p) {
      if ((n = Object.getOwnPropertyDescriptor(p, f)).set) return n.set.call(i, o), !0;
      if (!n.writable) return !1;
    }
    if (n = Object.getOwnPropertyDescriptor(i, f)) {
      if (!n.writable) return !1;
      n.value = o, Object.defineProperty(i, f, n);
    } else defineProperty(i, f, o);
    return !0;
  }, set(r, f, o, i);
}
function _set(e, t, r, f, o) {
  if (!set(e, t, r, f || e) && o) throw new TypeError("failed to set property");
  return r;
}
module.exports = _set, module.exports.__esModule = true, module.exports["default"] = module.exports;