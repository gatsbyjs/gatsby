"use strict";

exports.__esModule = true;
exports.default = void 0;

const getOriginalReferrer = () => // regex from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
document.cookie.replace(/(?:(?:^|.*;\s*)gatsbyOriginalReferrer\s*=\s*([^;]*).*$)|^.*$/, `$1`) || null;

var _default = {
  getOriginalReferrer
};
exports.default = _default;