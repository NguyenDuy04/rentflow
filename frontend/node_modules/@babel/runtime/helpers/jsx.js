var e;
function _createRawReactElement(r, o, l, n) {
  e || (e = "function" == typeof Symbol && Symbol["for"] && Symbol["for"]("react.element") || 60103);
  var t = r && r.defaultProps,
    f = arguments.length - 3;
  if (o || 0 === f || (o = {
    children: void 0
  }), f > 0) {
    var a = n;
    if (f > 1) {
      a = Array(f);
      for (var i = 0; i < f; i++) a[i] = arguments[i + 3];
    }
    o.children = a;
  }
  if (o && t) for (var u in t) void 0 === o[u] && (o[u] = t[u]);else o || (o = t || {});
  return {
    $$typeof: e,
    type: r,
    key: void 0 === l ? null : "" + l,
    ref: null,
    props: o,
    _owner: null
  };
}
module.exports = _createRawReactElement, module.exports.__esModule = true, module.exports["default"] = module.exports;