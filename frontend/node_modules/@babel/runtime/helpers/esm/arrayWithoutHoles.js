import arrayLikeToArray from "./arrayLikeToArray.js";
function _arrayWithoutHoles(a) {
  if (Array.isArray(a)) return arrayLikeToArray(a);
}
export { _arrayWithoutHoles as default };