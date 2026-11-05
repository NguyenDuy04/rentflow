let createMetadataComponentsImpl;
if (process.env.__NEXT_PARALLEL_ROUTE_METADATA) {
    createMetadataComponentsImpl = require('./metadata-parallel').createMetadataComponents;
} else {
    createMetadataComponentsImpl = require('./metadata').createMetadataComponents;
}
export { createMetadataComponentsImpl as createMetadataComponents };

//# sourceMappingURL=index.js.map