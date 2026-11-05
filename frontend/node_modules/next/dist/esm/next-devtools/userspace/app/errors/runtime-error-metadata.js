const pendingMetadata = new WeakMap();
// Used only for the synchronous reportError -> window.error handoff.
export function setRuntimeErrorMetadata(error, metadata) {
    pendingMetadata.set(error, metadata);
}
export function takeRuntimeErrorMetadata(error) {
    const metadata = pendingMetadata.get(error);
    pendingMetadata.delete(error);
    return metadata;
}

//# sourceMappingURL=runtime-error-metadata.js.map