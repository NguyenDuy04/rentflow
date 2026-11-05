function _immutableUint8Array(e) {
  return "buffer" in e && (e = e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength)), new Uint8Array(e.transferToImmutable ? e.transferToImmutable() : e);
}
export { _immutableUint8Array as default };