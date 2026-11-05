import _createForOfIteratorHelper from "./createForOfIteratorHelper.js";
import createModuleNsFilter from "./createModuleNsFilter.js";
function _filterModuleNamespace(t) {
  var e,
    o = !1;
  try {
    var i = t(function (r) {
      if (Object(r) === r) try {
        var t = r.exports;
        if (void 0 !== t) {
          if (Object(t) !== t) throw new TypeError("import()'s `exports` must be an object");
          var _iterator = _createForOfIteratorHelper((e = [], t)),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var i = _step.value;
              if ("string" != typeof i) throw new TypeError("import()'s `exports` must be strings");
              e.push(i);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      } catch (r) {
        throw o = !0, r;
      }
      return r;
    });
  } catch (r) {
    if (o) return Promise.reject(r);
    throw r;
  }
  return e ? (e.sort(), i.then(createModuleNsFilter(e))) : i;
}
export { _filterModuleNamespace as default };