"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.publishPackagesLocallyAndInstall = publishPackagesLocallyAndInstall;
exports.startVerdaccio = startVerdaccio;
var _intersection2 = _interopRequireDefault(require("lodash/intersection"));
var _verdaccio = _interopRequireDefault(require("verdaccio"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _verdaccioConfig = require("./verdaccio-config");
var _publishPackage = require("./publish-package");
var _installPackages = require("./install-packages");
// eslint-disable-next-line @typescript-eslint/naming-convention

let VerdaccioInitPromise = null;
function startVerdaccio() {
  if (VerdaccioInitPromise) {
    return VerdaccioInitPromise;
  }
  console.log(`Starting local verdaccio server`);

  // clear storage
  _fsExtra.default.removeSync(_verdaccioConfig.verdaccioConfig.storage);
  VerdaccioInitPromise = new Promise(resolve => {
    (0, _verdaccio.default)(_verdaccioConfig.verdaccioConfig, _verdaccioConfig.verdaccioConfig.port.toString(), _verdaccioConfig.verdaccioConfig.storage, `1.0.0`, `gatsby-dev`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (webServer, addr, _pkgName, _pkgVersion) => {
      // console.log(webServer)
      webServer.listen(addr.port || addr.path, addr.host, () => {
        console.log(`Started local verdaccio server`);
        resolve(undefined);
      });
    });
  });
  return VerdaccioInitPromise;
}
async function publishPackagesLocallyAndInstall({
  packagesToPublish,
  localPackages,
  packageNameToPath,
  ignorePackageJSONChanges,
  yarnWorkspaceRoot,
  externalRegistry,
  root,
  packageManager
}) {
  await startVerdaccio();
  const versionPostFix = Date.now();
  const newlyPublishedPackageVersions = {};
  for (const packageName of packagesToPublish) {
    newlyPublishedPackageVersions[packageName] = await (0, _publishPackage.publishPackage)({
      packageName,
      packagesToPublish,
      packageNameToPath,
      versionPostFix,
      ignorePackageJSONChanges,
      root
    });
  }
  const packagesToInstall = (0, _intersection2.default)(packagesToPublish, localPackages);
  await (0, _installPackages.installPackages)({
    packagesToInstall,
    yarnWorkspaceRoot,
    newlyPublishedPackageVersions,
    externalRegistry,
    packageManager
  });
}