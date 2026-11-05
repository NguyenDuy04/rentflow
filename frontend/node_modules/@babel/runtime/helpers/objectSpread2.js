var defineProperty = require("./defineProperty.js");
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(r) {
  for (var t = 1; t < arguments.length; t++) {
    var o = null != arguments[t] ? arguments[t] : {};
    t % 2 ? ownKeys(Object(o), !0).forEach(function (t) {
      defineProperty(r, t, o[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : ownKeys(Object(o)).forEach(function (e) {
      Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e));
    });
  }
  return r;
}
module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;