import getPrototypeOf from "./getPrototypeOf.js";
import isNativeReflectConstruct from "./isNativeReflectConstruct.js";
import possibleConstructorReturn from "./possibleConstructorReturn.js";
function _callSuper(e, c, p) {
  return c = getPrototypeOf(c), possibleConstructorReturn(e, isNativeReflectConstruct() ? Reflect.construct(c, p || [], getPrototypeOf(e).constructor) : c.apply(e, p));
}
export { _callSuper as default };