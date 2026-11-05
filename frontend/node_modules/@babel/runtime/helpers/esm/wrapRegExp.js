import _typeof from "./typeof.js";
import setPrototypeOf from "./setPrototypeOf.js";
import inherits from "./inherits.js";
function _wrapRegExp() {
  _wrapRegExp = function _wrapRegExp(e, r) {
    return new BabelRegExp(e, void 0, r);
  };
  var t = RegExp.prototype,
    p = new WeakMap();
  function BabelRegExp(r, t, o) {
    var n = RegExp(r, t);
    return p.set(n, o || p.get(r)), setPrototypeOf(n, BabelRegExp.prototype);
  }
  function buildGroups(e, r) {
    var t = p.get(r);
    return Object.keys(t).reduce(function (r, p) {
      var o = t[p];
      if ("number" == typeof o) r[p] = e[o];else {
        for (var n = 0; void 0 === e[o[n]] && n + 1 < o.length;) n++;
        r[p] = e[o[n]];
      }
      return r;
    }, Object.create(null));
  }
  return inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (e) {
    var r = t.exec.call(this, e);
    if (r) {
      r.groups = buildGroups(r, this);
      var p = r.indices;
      p && (p.groups = buildGroups(p, this));
    }
    return r;
  }, BabelRegExp.prototype[Symbol.replace] = function (e, r) {
    if ("string" == typeof r) {
      var o = p.get(this);
      return t[Symbol.replace].call(this, e, r.replace(/\$<([^>]+)(>|$)/g, function (e, r, t) {
        if ("" === t) return e;
        var p = o[r];
        return Array.isArray(p) ? "$" + p.join("$") : "number" == typeof p ? "$" + p : "";
      }));
    }
    if ("function" == typeof r) {
      var n = this;
      return t[Symbol.replace].call(this, e, function () {
        var e = arguments;
        return "object" != _typeof(e[e.length - 1]) && (e = [].slice.call(e)).push(buildGroups(e, n)), r.apply(this, e);
      });
    }
    return t[Symbol.replace].call(this, e, r);
  }, _wrapRegExp.apply(this, arguments);
}
export { _wrapRegExp as default };