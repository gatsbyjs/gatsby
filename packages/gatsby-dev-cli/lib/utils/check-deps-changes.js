"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.checkDepsChanges = checkDepsChanges;
var _uniq2 = _interopRequireDefault(require("lodash/uniq"));
var _isObject2 = _interopRequireDefault(require("lodash/isObject"));
var _isEqual2 = _interopRequireDefault(require("lodash/isEqual"));
var _transform2 = _interopRequireDefault(require("lodash/transform"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _getMonorepoPackageJsonPath = require("./get-monorepo-package-json-path");
var _got = _interopRequireDefault(require("got"));
// eslint-disable-next-line @typescript-eslint/naming-convention

// @ts-ignore

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function difference(object, base) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function changes(object, base) {
    return (0, _transform2.default)(object, function (result, value, key) {
      if (!(0, _isEqual2.default)(value, base[key])) {
        result[key] = (0, _isObject2.default)(value) && (0, _isObject2.default)(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

/**
 * Compare dependencies of installed packages and monorepo package.
 * It will skip dependencies that are removed in monorepo package.
 *
 * If local package is not installed, it will check unpkg.com.
 * This allow gatsby-dev to skip publishing unnecesairly and
 * let install packages from public npm repository if nothing changed.
 */
async function checkDepsChanges({
  newPath,
  packageName,
  monoRepoPackages,
  isInitialScan,
  ignoredPackageJSON,
  packageNameToPath
}) {
  let localPKGjson;
  let packageNotInstalled = false;
  try {
    localPKGjson = JSON.parse(_fsExtra.default.readFileSync(newPath, `utf-8`));
  } catch {
    packageNotInstalled = true;
    // there is no local package - so we still need to install deps
    // this is nice because devs won't need to do initial package installation - we can handle this.
    if (!isInitialScan) {
      console.log(`'${packageName}' doesn't seem to be installed. Restart gatsby-dev to publish it`);
      return {
        didDepsChanged: false,
        packageNotInstalled
      };
    }

    // if package is not installed, we will do http GET request to
    // unkpg to check if dependency in package published in public
    // npm repository are different

    // this allow us to not publish to local repository
    // and save some time/work
    try {
      const version = getPackageVersion(packageName);
      const url = `https://unpkg.com/${packageName}@${version}/package.json`;
      const response = await (0, _got.default)(url);
      if ((response === null || response === void 0 ? void 0 : response.statusCode) !== 200) {
        throw new Error(`No response or non 200 code for ${url}`);
      }
      localPKGjson = JSON.parse(response.body);
    } catch (e) {
      console.log(`'${packageName}' doesn't seem to be installed and is not published on NPM. Error: ${e.message}`);
      return {
        didDepsChanged: true,
        packageNotInstalled
      };
    }
  }
  const monoRepoPackageJsonPath = (0, _getMonorepoPackageJsonPath.getMonorepoPackageJsonPath)({
    packageName,
    packageNameToPath
  });
  const monorepoPKGjsonString = _fsExtra.default.readFileSync(monoRepoPackageJsonPath, `utf-8`);
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString);
  if (ignoredPackageJSON.has(packageName)) {
    if (ignoredPackageJSON.get(packageName).includes(monorepoPKGjsonString)) {
      // we are in middle of publishing and content of package.json is one set during publish process,
      // so we need to not cause false positives
      return {
        didDepsChanged: false,
        packageNotInstalled
      };
    }
  }
  if (!monorepoPKGjson.dependencies) monorepoPKGjson.dependencies = {};
  if (!localPKGjson.dependencies) localPKGjson.dependencies = {};
  const areDepsEqual = (0, _isEqual2.default)(monorepoPKGjson.dependencies, localPKGjson.dependencies);
  if (!areDepsEqual) {
    const diff = difference(monorepoPKGjson.dependencies, localPKGjson.dependencies);
    const diff2 = difference(localPKGjson.dependencies, monorepoPKGjson.dependencies);
    let needPublishing = false;
    let isPublishing = false;
    const depChangeLog = (0, _uniq2.default)(Object.keys({
      ...diff,
      ...diff2
    })).reduce((acc, key) => {
      var _monorepoPKGjson$depe, _monorepoPKGjson$depe2, _monorepoPKGjson$depe3;
      if (((_monorepoPKGjson$depe = monorepoPKGjson.dependencies) === null || _monorepoPKGjson$depe === void 0 ? void 0 : _monorepoPKGjson$depe[key]) === `gatsby-dev`) {
        // if we are in middle of publishing to local repository - ignore
        isPublishing = true;
        return acc;
      }
      if (localPKGjson.dependencies[key] === `gatsby-dev`) {
        // monorepo packages will restore version, but after installation
        // in local site - it will use `gatsby-dev` dist tag - we need
        // to ignore changes that
        return acc;
      }
      if (localPKGjson.dependencies[key] && (_monorepoPKGjson$depe2 = monorepoPKGjson.dependencies) !== null && _monorepoPKGjson$depe2 !== void 0 && _monorepoPKGjson$depe2[key]) {
        // Check only for version changes in packages
        // that are not from gatsby repo.
        // Changes in gatsby packages will be copied over
        // from monorepo - and if those contain other dependency
        // changes - they will be covered
        if (!monoRepoPackages.includes(key)) {
          acc.push(` - '${key}' changed version from ${localPKGjson.dependencies[key]} to ${monorepoPKGjson.dependencies[key]}`);
          needPublishing = true;
        }
      } else if ((_monorepoPKGjson$depe3 = monorepoPKGjson.dependencies) !== null && _monorepoPKGjson$depe3 !== void 0 && _monorepoPKGjson$depe3[key]) {
        acc.push(` - '${key}@${monorepoPKGjson.dependencies[key]}' was added`);
        needPublishing = true;
      } else {
        acc.push(` - '${key}@${localPKGjson.dependencies[key]}' was removed`);
        // this doesn't need publishing really, so will skip this
      }
      return acc;
    }, []).join(`\n`);
    if (!isPublishing && depChangeLog.length > 0) {
      console.log(`Dependencies of '${packageName}' changed:\n${depChangeLog}`);
      if (isInitialScan) {
        console.log(`Will ${!needPublishing ? `not ` : ``}publish to local npm registry.`);
      } else {
        console.warn(`Installation of dependencies after initial scan is not implemented`);
      }
      return {
        didDepsChanged: needPublishing,
        packageNotInstalled
      };
    }
  }
  return {
    didDepsChanged: false,
    packageNotInstalled
  };
}
function getPackageVersion(packageName) {
  const projectPackageJson = JSON.parse(_fsExtra.default.readFileSync(`./package.json`, `utf-8`));
  const {
    dependencies = {},
    devDependencies = {}
  } = projectPackageJson;
  const version = dependencies[packageName] || devDependencies[packageName];
  return version || `latest`;
}