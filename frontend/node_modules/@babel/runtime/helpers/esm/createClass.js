import toPropertyKey from "./toPropertyKey.js";
function _defineProperties(r, t) {
  for (var o = 0; o < t.length; o++) {
    var i = t[o];
    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(r, toPropertyKey(i.key), i);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
export { _createClass as default };