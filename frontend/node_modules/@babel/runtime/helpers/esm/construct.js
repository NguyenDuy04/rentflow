import isNativeReflectConstruct from "./isNativeReflectConstruct.js";
import setPrototypeOf from "./setPrototypeOf.js";
function _construct(e, o, p) {
  if (isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var n = [null];
  n.push.apply(n, o);
  var l = new (e.bind.apply(e, n))();
  return p && setPrototypeOf(l, p.prototype), l;
}
export { _construct as default };