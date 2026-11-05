function _importDeferProxy(e) {
  var t;
  function r() {
    return !1;
  }
  function n(r) {
    return function (n, o, f) {
      return r(t || (t = e()), o, f);
    };
  }
  return new Proxy({
    __proto__: null
  }, {
    defineProperty: r,
    deleteProperty: r,
    get: n(Reflect.get),
    getOwnPropertyDescriptor: n(Reflect.getOwnPropertyDescriptor),
    isExtensible: r,
    has: n(Reflect.has),
    ownKeys: n(Reflect.ownKeys),
    preventExtensions: function preventExtensions() {
      return !0;
    },
    set: r,
    setPrototypeOf: r
  });
}
module.exports = _importDeferProxy, module.exports.__esModule = true, module.exports["default"] = module.exports;