"use strict";

exports.__esModule = true;
exports.publishPackage = publishPackage;
var _fsExtra = require("fs-extra");
var _path = require("path");
var _verdaccioConfig = require("./verdaccio-config");
var _cleanupTasks = require("./cleanup-tasks");
var _promisifiedSpawn = require("../utils/promisified-spawn");
var _getMonorepoPackageJsonPath = require("../utils/get-monorepo-package-json-path");
const NPMRCContent = `${_verdaccioConfig.registryUrl.replace(/https?:/g, ``)}/:_authToken="gatsby-dev"`;

/**
 * Edit package.json to:
 *  - adjust version to temporary one
 *  - change version selectors for dependencies that
 *    will be published, to make sure that pnpm
 *    install them in local site
 */
function adjustPackageJson({
  monoRepoPackageJsonPath,
  packageName,
  versionPostFix,
  packagesToPublish,
  ignorePackageJSONChanges,
  packageNameToPath
}) {
  // we need to check if package depend on any other package to will be published and
  // adjust version selector to point to dev version of package so local registry is used
  // for dependencies.

  const monorepoPKGjsonString = (0, _fsExtra.readFileSync)(monoRepoPackageJsonPath, `utf-8`);
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString);
  monorepoPKGjson.version = `${monorepoPKGjson.version}-dev-${versionPostFix}`;
  packagesToPublish.forEach(packageThatWillBePublished => {
    if (monorepoPKGjson.dependencies && monorepoPKGjson.dependencies[packageThatWillBePublished]) {
      const packagePath = (0, _getMonorepoPackageJsonPath.getMonorepoPackageJsonPath)({
        packageName: packageThatWillBePublished,
        packageNameToPath
      });
      const file = (0, _fsExtra.readFileSync)(packagePath, `utf-8`);
      const currentVersion = JSON.parse(file).version;
      monorepoPKGjson.dependencies[packageThatWillBePublished] = `${currentVersion}-dev-${versionPostFix}`;
    }
  });
  const temporaryMonorepoPKGjsonString = JSON.stringify(monorepoPKGjson);
  const unignorePackageJSONChanges = ignorePackageJSONChanges(packageName, [monorepoPKGjsonString, temporaryMonorepoPKGjsonString]);

  // change version and dependency versions
  (0, _fsExtra.outputFileSync)(monoRepoPackageJsonPath, temporaryMonorepoPKGjsonString);
  return {
    newPackageVersion: monorepoPKGjson.version,
    unadjustPackageJson: (0, _cleanupTasks.registerCleanupTask)(() => {
      // restore original package.json
      (0, _fsExtra.outputFileSync)(monoRepoPackageJsonPath, monorepoPKGjsonString);
      unignorePackageJSONChanges();
    })
  };
}

/**
 * Anonymous publishing require dummy .npmrc
 * See https://github.com/verdaccio/verdaccio/issues/212#issuecomment-308578500
 * This is `pnpm publish` (as in linked comment) and `pnpm publish` requirement.
 * This is not verdaccio restriction.
 */
function createTemporaryNPMRC({
  pathToPackage,
  root
}) {
  const NPMRCPathInPackage = (0, _path.join)(pathToPackage, `.npmrc`);
  (0, _fsExtra.outputFileSync)(NPMRCPathInPackage, NPMRCContent);
  const NPMRCPathInRoot = (0, _path.join)(root, `.npmrc`);
  (0, _fsExtra.outputFileSync)(NPMRCPathInRoot, NPMRCContent);
  return (0, _cleanupTasks.registerCleanupTask)(() => {
    (0, _fsExtra.removeSync)(NPMRCPathInPackage);
    (0, _fsExtra.removeSync)(NPMRCPathInRoot);
  });
}
async function publishPackage({
  packageName,
  packagesToPublish,
  versionPostFix,
  ignorePackageJSONChanges,
  packageNameToPath,
  root
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  const monoRepoPackageJsonPath = (0, _getMonorepoPackageJsonPath.getMonorepoPackageJsonPath)({
    packageName,
    packageNameToPath
  });
  const {
    unadjustPackageJson,
    newPackageVersion
  } = adjustPackageJson({
    monoRepoPackageJsonPath,
    packageName,
    packageNameToPath,
    versionPostFix,
    packagesToPublish,
    ignorePackageJSONChanges
  });
  const pathToPackage = (0, _path.dirname)(monoRepoPackageJsonPath);
  const uncreateTemporaryNPMRC = createTemporaryNPMRC({
    pathToPackage,
    root
  });

  // npm publish
  const publishCmd = [`npm`, [`publish`, `--tag`, `gatsby-dev`, `--registry=${_verdaccioConfig.registryUrl}`], {
    cwd: pathToPackage
  }];
  console.log(`Publishing ${packageName}@${newPackageVersion} to local registry`);
  try {
    await (0, _promisifiedSpawn.promisifiedSpawn)(publishCmd);
    console.log(`Published ${packageName}@${newPackageVersion} to local registry`);
  } catch (e) {
    console.error(`Failed to publish ${packageName}@${newPackageVersion}`, e);
    process.exit(1);
  }
  uncreateTemporaryNPMRC();
  unadjustPackageJson();
  return newPackageVersion;
}