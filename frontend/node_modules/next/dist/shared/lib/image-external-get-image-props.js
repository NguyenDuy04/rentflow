"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getImageProps", {
    enumerable: true,
    get: function() {
        return getImageProps;
    }
});
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _imageconfig = require("./image-config");
const _getimgprops = require("./get-img-props");
const _imageloader = /*#__PURE__*/ _interop_require_wildcard._(require("next/dist/shared/lib/image-loader"));
const defaultLoader = Reflect.get(_imageloader, 'default');
// The bundler replaces this with fixed options. Public getImageProps has no
// context, so prepare those options once when the module is loaded.
const imageConfig = (0, _imageconfig.prepareImageConfig)(process.env.__NEXT_IMAGE_OPTS);
function getImageProps(imgProps) {
    const { props } = (0, _getimgprops.getImgProps)(imgProps, {
        defaultLoader,
        imgConf: imageConfig
    });
    // Normally we don't care about undefined props because we pass to JSX,
    // but this exported function could be used by the end user for anything
    // so we delete undefined props to clean it up a little.
    for (const [key, value] of Object.entries(props)){
        if (value === undefined) {
            delete props[key];
        }
    }
    return {
        props
    };
}

//# sourceMappingURL=image-external-get-image-props.js.map