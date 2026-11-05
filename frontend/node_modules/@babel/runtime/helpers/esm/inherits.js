import setPrototypeOf from "./setPrototypeOf.js";
function _inherits(t, r) {
  if ("function" != typeof r && null !== r) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(r && r.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), r && setPrototypeOf(t, r);
}
export { _inherits as default };