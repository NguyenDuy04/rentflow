var regeneratorAsyncGen = require("./regeneratorAsyncGen.js");
function _regeneratorAsync(n, r, t, o, u) {
  var a = regeneratorAsyncGen(n, r, t, o, u);
  return a.next().then(function (e) {
    return e.done ? e.value : a.next();
  });
}
module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;