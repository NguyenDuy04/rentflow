"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMetadataComponents", {
    enumerable: true,
    get: function() {
        return createMetadataComponentsImpl;
    }
});
let createMetadataComponentsImpl;
if (process.env.__NEXT_PARALLEL_ROUTE_METADATA) {
    createMetadataComponentsImpl = require('./metadata-parallel').createMetadataComponents;
} else {
    createMetadataComponentsImpl = require('./metadata').createMetadataComponents;
}

//# sourceMappingURL=index.js.map