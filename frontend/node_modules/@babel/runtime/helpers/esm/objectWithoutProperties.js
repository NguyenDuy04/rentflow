import objectWithoutPropertiesLoose from "./objectWithoutPropertiesLoose.js";
function _objectWithoutProperties(t, r) {
  if (null == t) return {};
  var o,
    n,
    i = objectWithoutPropertiesLoose(t, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(t);
    for (n = 0; n < l.length; n++) o = l[n], -1 === r.indexOf(o) && {}.propertyIsEnumerable.call(t, o) && (i[o] = t[o]);
  }
  return i;
}
export { _objectWithoutProperties as default };