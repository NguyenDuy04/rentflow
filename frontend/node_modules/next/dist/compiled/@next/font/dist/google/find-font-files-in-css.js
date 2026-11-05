"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFontFilesInCss = findFontFilesInCss;
const formatToExtension = new Map([
    ['woff', 'woff'],
    ['woff2', 'woff2'],
    ['truetype', 'ttf'],
    ['opentype', 'otf'],
    ['embedded-opentype', 'eot'],
]);
/**
 * Find all font files in the CSS response and determine which files should be preloaded.
 * In Google Fonts responses, the @font-face's subset is above it in a comment.
 * Walk through the CSS from top to bottom, keeping track of the current subset.
 */
function findFontFilesInCss(css, subsetsToPreload) {
    var _a, _b, _c, _d, _e, _f;
    // Find font files to download
    const fontFiles = [];
    // Keep track of the current subset
    let currentSubset = '';
    for (const line of css.split('\n')) {
        const newSubset = (_a = /\/\* (.+?) \*\//.exec(line)) === null || _a === void 0 ? void 0 : _a[1];
        if (newSubset) {
            // Found new subset in a comment above the next @font-face declaration
            currentSubset = newSubset;
        }
        else {
            const googleFontFileUrl = (_b = /src: url\((.+?)\)/.exec(line)) === null || _b === void 0 ? void 0 : _b[1];
            if (googleFontFileUrl &&
                !fontFiles.some((foundFile) => foundFile.googleFontFileUrl === googleFontFileUrl)) {
                // Google can return extensionless /l/font?kit=... URLs. Prefer the
                // pathname extension, then the CSS format hint. Our Chrome user agent
                // requests WOFF2, so use that when neither specifies a supported type.
                const pathname = googleFontFileUrl.split(/[?#]/, 1)[0];
                const format = (_c = /format\(['"](.+?)['"]\)/.exec(line)) === null || _c === void 0 ? void 0 : _c[1];
                const ext = (_f = (_e = (_d = /\.(woff|woff2|eot|ttf|otf)$/.exec(pathname)) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : formatToExtension.get(format !== null && format !== void 0 ? format : '')) !== null && _f !== void 0 ? _f : 'woff2';
                fontFiles.push({
                    googleFontFileUrl,
                    preloadFontFile: !!(subsetsToPreload === null || subsetsToPreload === void 0 ? void 0 : subsetsToPreload.includes(currentSubset)),
                    ext,
                });
            }
        }
    }
    return fontFiles;
}
