"use strict";

exports.__esModule = true;
exports.getVersionInfo = getVersionInfo;
var _package = require("../../package.json");
function getVersionInfo() {
  return `Gatsby Dev CLI version: ${_package.version}`;
}