"use strict";

exports.__esModule = true;
exports.default = void 0;

/**
 * Remove a prefix from a string. Return the input string if the given prefix
 * isn't found.
 */
var _default = (str, prefix = ``) => {
  if (!prefix) {
    return str;
  }

  prefix += `/`;

  if (str.substr(0, prefix.length) === prefix) {
    return str.slice(prefix.length - 1);
  }

  return str;
};

exports.default = _default;