import OverloadYield from "./OverloadYield.js";
function _asyncGeneratorDelegate(n) {
  var r = {},
    e = !1;
  function pump(r, o) {
    return e = !0, o = new Promise(function (t) {
      t(n[r](o));
    }), {
      done: !1,
      value: new OverloadYield(o, 1)
    };
  }
  return r["undefined" != typeof Symbol && Symbol.iterator || "@@iterator"] = function () {
    return this;
  }, r.next = function (t) {
    return e ? (e = !1, t) : pump("next", t);
  }, "function" == typeof n["throw"] && (r["throw"] = function (t) {
    if (e) throw e = !1, t;
    return pump("throw", t);
  }), "function" == typeof n["return"] && (r["return"] = function (t) {
    return e ? (e = !1, t) : pump("return", t);
  }), r;
}
export { _asyncGeneratorDelegate as default };