function _immutableUint8Array(e) {
  return "buffer" in e && (e = e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength)), new Uint8Array(e.transferToImmutable ? e.transferToImmutable() : e);
}
module.exports = _immutableUint8Array, module.exports.__esModule = true, module.exports["default"] = module.exports;