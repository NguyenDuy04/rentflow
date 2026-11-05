import unsupportedIterableToArray from "./unsupportedIterableToArray.js";
function _createForOfIteratorHelperLoose(r, t) {
  var o = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (o) return (o = o.call(r)).next.bind(o);
  if (Array.isArray(r) || (o = unsupportedIterableToArray(r)) || t && r && "number" == typeof r.length) {
    o && (r = o);
    var n = 0;
    return function () {
      return n >= r.length ? {
        done: !0
      } : {
        done: !1,
        value: r[n++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
export { _createForOfIteratorHelperLoose as default };