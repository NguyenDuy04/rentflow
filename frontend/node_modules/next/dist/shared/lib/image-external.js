'use turbopack: no side effects';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    getImageProps: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _imagecomponent.Image;
    },
    getImageProps: function() {
        return _imageexternalgetimageprops.getImageProps;
    }
});
const _imagecomponent = require("../../client/image-component");
const _imageexternalgetimageprops = require("./image-external-get-image-props");

//# sourceMappingURL=image-external.js.map