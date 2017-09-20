"use strict";

exports.__esModule = true;
exports.default = writeRedirectsFile;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _pify = require("pify");

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeFile = (0, _pify2.default)(_fs2.default.writeFile);

function writeRedirectsFile(pluginData, redirects) {
  const { publicFolder } = pluginData;

  // https://www.netlify.com/docs/redirects/
  const data = redirects.map(redirect => {
    const status = redirect.isPermanent ? 301 : 302;
    return `${redirect.fromPath}  ${redirect.toPath}  ${status}`;
  });

  return writeFile(publicFolder(`_redirects`), data.join(`\n`));
}