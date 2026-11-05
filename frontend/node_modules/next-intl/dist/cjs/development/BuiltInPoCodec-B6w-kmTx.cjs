'use strict';

var createPoCodec = require('@eloqnt/format-po');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var createPoCodec__default = /*#__PURE__*/_interopDefaultCompat(createPoCodec);

// Derived from `@eloqnt/config`, so next-intl and eloqnt pass identical
// options to codecs.

function defineCodec(factory) {
  return factory;
}

// `@eloqnt/format-po`, guarded so catalogs in the previous key-based layout
// fail loudly. Custom codecs referencing the package directly opt out.
var BuiltInPoCodec = defineCodec(() => {
  const codec = createPoCodec__default.default();
  function assertMigrated(content) {
    if (content.includes('X-Crowdin-SourceKey: msgstr')) {
      throw new Error('This catalog uses the previous PO layout of next-intl, which stored message keys in `msgid`. The PO format now follows the gettext convention: the source text in `msgid` and the message key in `msgctxt`. Please migrate your catalogs, or use a custom codec to keep the previous layout: https://github.com/amannn/next-intl/pull/2393');
    }
  }
  return {
    ...codec,
    decode(content, context) {
      assertMigrated(content);
      return codec.decode(content, context);
    }
  };
});

exports.default = BuiltInPoCodec;
