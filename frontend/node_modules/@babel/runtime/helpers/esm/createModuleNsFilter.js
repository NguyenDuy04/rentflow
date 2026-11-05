function _createModuleNsFilter(e) {
  return function (r) {
    for (var getter = function getter(e) {
        return function () {
          return r[e];
        };
      }, t = Object.create(null), n = 0; n < e.length; n++) {
      var o = e[n];
      if (!(o in r)) throw new ReferenceError("The requested module does not provide an export named '" + o + "'");
      o in t || Object.defineProperty(t, o, {
        enumerable: !0,
        get: getter(o)
      });
    }
    return Object.defineProperty(t, Symbol.toStringTag, {
      value: "Module"
    }), Object.freeze(t);
  };
}
export { _createModuleNsFilter as default };