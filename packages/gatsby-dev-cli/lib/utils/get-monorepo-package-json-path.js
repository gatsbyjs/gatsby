"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getMonorepoPackageJsonPath = getMonorepoPackageJsonPath;
var _nodePath = _interopRequireDefault(require("node:path"));
function getMonorepoPackageJsonPath({
  packageName,
  packageNameToPath
}) {
  return _nodePath.default.join(packageNameToPath.get(packageName), `package.json`);
}