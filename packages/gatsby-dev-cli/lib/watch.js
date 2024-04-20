"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.watch = watch;
var _includes2 = _interopRequireDefault(require("lodash/includes"));
var _some2 = _interopRequireDefault(require("lodash/some"));
var _intersection2 = _interopRequireDefault(require("lodash/intersection"));
var _uniq2 = _interopRequireDefault(require("lodash/uniq"));
var _chokidar = _interopRequireDefault(require("chokidar"));
var _del = _interopRequireDefault(require("del"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _findYarnWorkspaceRoot = _interopRequireDefault(require("find-yarn-workspace-root"));
var _index = require("./local-npm-registry/index");
var _checkDepsChanges = require("./utils/check-deps-changes");
var _getDependantPackages = require("./utils/get-dependant-packages");
var _promisifiedSpawn = require("./utils/promisified-spawn");
var _traversePackageDeps = require("./utils/traverse-package-deps");
// eslint-disable-next-line @typescript-eslint/naming-convention

// @ts-ignore

let numCopied = 0;
function quit() {
  console.log(`Copied ${numCopied} files`);
  process.exit();
}
const MAX_COPY_RETRIES = 3;

/*
 * non-existent packages break on('ready')
 * See: https://github.com/paulmillr/chokidar/issues/449
 */
async function watch(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
root, packages, {
  scanOnce,
  quiet,
  forceInstall,
  monoRepoPackages,
  localPackages,
  packageNameToPath,
  externalRegistry,
  packageManager
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  (0, _promisifiedSpawn.setDefaultSpawnStdio)(quiet ? `ignore` : `inherit`);
  // determine if in yarn workspace - if in workspace, force using verdaccio
  // as current logic of copying files will not work correctly.
  const yarnWorkspaceRoot = (0, _findYarnWorkspaceRoot.default)();
  if (yarnWorkspaceRoot && process.env.NODE_ENV !== `test`) {
    console.log(`Yarn workspace found.`);
    forceInstall = true;
  }
  let afterPackageInstallation = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queuedCopies = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function realCopyPath(arg) {
    const {
      oldPath,
      newPath,
      quiet,
      resolve,
      reject,
      retry = 0
    } = arg;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fsExtra.default.copy(oldPath, newPath, err => {
      if (err) {
        if (retry >= MAX_COPY_RETRIES) {
          console.error(err);
          reject(err);
          return;
        } else {
          globalThis.setTimeout(() => {
            return realCopyPath({
              ...arg,
              retry: retry + 1
            });
          }, 500 * Math.pow(2, retry));
          return;
        }
      }

      // When the gatsby binary is copied over, it is not setup with the executable
      // permissions that it is given when installed via yarn.
      // This fixes the issue where after running gatsby-dev, running `pnpm run gatsby develop`
      // fails with a permission issue.
      // @fixes https://github.com/gatsbyjs/gatsby/issues/18809
      // Binary files we target:
      // - gatsby/bin/gatsby.js
      //  -gatsby/cli.js
      //  -gatsby-cli/cli.js
      if (/(bin\/gatsby.js|gatsby(-cli)?\/cli.js)$/.test(newPath)) {
        _fsExtra.default.chmodSync(newPath, `0755`);
      }
      numCopied += 1;
      if (!quiet) {
        console.log(`Copied ${oldPath} to ${newPath}`);
      }
      resolve();
    });
  }
  function copyPath(oldPath, newPath,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiet, packageName) {
    return new Promise((resolve, reject) => {
      const argObj = {
        oldPath,
        newPath,
        quiet,
        packageName,
        resolve,
        reject
      };
      if (afterPackageInstallation) {
        realCopyPath(argObj);
      } else {
        queuedCopies.push(argObj);
      }
    });
  }
  function runQueuedCopies() {
    afterPackageInstallation = true;
    queuedCopies.forEach(argObj => realCopyPath(argObj));
    queuedCopies = [];
  }
  async function clearJSFilesFromNodeModules() {
    const packagesToClear = queuedCopies.reduce((acc, {
      packageName
    }) => {
      if (packageName) {
        acc.add(packageName);
      }
      return acc;
    }, new Set());
    await Promise.all([...packagesToClear].map(async packageToClear => await _del.default.deleteAsync([`node_modules/${packageToClear}/**/*.{js,js.map}`, `!node_modules/${packageToClear}/node_modules/**/*.{js,js.map}`, `!node_modules/${packageToClear}/src/**/*.{js,js.map}`])));
  }
  // check packages deps and if they depend on other packages from monorepo
  // add them to packages list
  const {
    seenPackages,
    depTree
  } = (0, _traversePackageDeps.traversePackagesDeps)({
    // root,
    packages: (0, _uniq2.default)(localPackages),
    monoRepoPackages,
    packageNameToPath
  });
  const allPackagesToWatch = packages ? (0, _intersection2.default)(Array.from(packages), seenPackages) : seenPackages;
  const ignoredPackageJSON = new Map();
  function ignorePackageJSONChanges(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentArray) {
    ignoredPackageJSON.set(packageName, contentArray);
    return () => {
      ignoredPackageJSON.delete(packageName);
    };
  }
  if (forceInstall) {
    try {
      if (allPackagesToWatch.length > 0) {
        await (0, _index.publishPackagesLocallyAndInstall)({
          packagesToPublish: allPackagesToWatch,
          packageNameToPath,
          localPackages,
          ignorePackageJSONChanges,
          yarnWorkspaceRoot,
          externalRegistry,
          root,
          packageManager
        });
      } else {
        // run `pnpm install`
        const pnpmInstallCmd = [`pnpm install`];
        console.log(`Installing packages from public NPM registry`);
        await (0, _promisifiedSpawn.promisifiedSpawn)(pnpmInstallCmd);
        console.log(`Installation complete`);
      }
    } catch (e) {
      console.log(e);
    }
    process.exit();
  }
  if (allPackagesToWatch.length === 0) {
    console.error(`There are no packages to watch.`);
    return;
  }
  const allPackagesIgnoringThemesToWatch = allPackagesToWatch.filter(pkgName => !pkgName.startsWith(`gatsby-theme`));
  const ignored = [/[/\\]node_modules[/\\]/i, /\.git/i, /\.DS_Store/, /[/\\]__tests__[/\\]/i, /[/\\]__mocks__[/\\]/i, /\.npmrc/i].concat(allPackagesIgnoringThemesToWatch.map(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`)));
  const watchers = (0, _uniq2.default)(allPackagesToWatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .map(p => _path.default.join(packageNameToPath.get(p))).filter(p => _fsExtra.default.existsSync(p)));
  let allCopies = [];
  const packagesToPublish = new Set();
  let isInitialScan = true;
  let isPublishing = false;
  const waitFor = new Set();
  let anyPackageNotInstalled = false;
  const watchEvents = [`change`, `add`];
  const packagePathMatchingEntries = Array.from(packageNameToPath.entries());
  _chokidar.default.watch(watchers, {
    ignored: [filePath => {
      return (0, _some2.default)(ignored, reg => {
        return reg.test(filePath);
      });
    }]
  }).on(`all`, async (event, filePath) => {
    if (!watchEvents.includes(event)) {
      return;
    }

    // match against paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let packageName;

    // @ts-ignore
    for (const [_packageName, packagePath] of packagePathMatchingEntries) {
      const relativeToThisPackage = _path.default.relative(packagePath, filePath);
      if (!relativeToThisPackage.startsWith(`..`)) {
        packageName = _packageName;
        break;
      }
    }
    if (!packageName) {
      return;
    }
    const prefix = packageNameToPath.get(packageName);

    // Copy it over local version.
    // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
    if ((0, _includes2.default)(filePath, `dist/gatsby-cli.js`)) {
      return;
    }
    const relativePackageFile = _path.default.relative(prefix, filePath);
    const newPath = _path.default.join(`./node_modules/${packageName}`, relativePackageFile);
    if (relativePackageFile === `package.json`) {
      // package.json files will change during publish to adjust version of package (and dependencies), so ignore
      // changes during this process
      if (isPublishing) {
        return;
      }

      // Compare dependencies with local version

      const didDepsChangedPromise = (0, _checkDepsChanges.checkDepsChanges)({
        newPath,
        packageName,
        monoRepoPackages,
        packageNameToPath,
        isInitialScan,
        ignoredPackageJSON
      });
      if (isInitialScan) {
        // normally checkDepsChanges would be sync,
        // but because it also can do async GET request
        // to unpkg if local package is not installed
        // keep track of it to make sure all of it
        // finish before installing

        waitFor.add(didDepsChangedPromise);
      }
      const {
        didDepsChanged,
        packageNotInstalled
      } = await didDepsChangedPromise;
      if (packageNotInstalled) {
        anyPackageNotInstalled = true;
      }
      if (didDepsChanged) {
        if (isInitialScan) {
          waitFor.delete(didDepsChangedPromise);
          // handle dependency change only in initial scan - this is for sure doable to
          // handle this in watching mode correctly - but for the sake of shipping
          // this I limit more work/time consuming edge cases.

          // Dependency changed - now we need to figure out
          // the packages that actually need to be published.
          // If package with changed dependencies is dependency of other
          // gatsby package - like for example `gatsby-plugin-page-creator`
          // we need to publish both `gatsby-plugin-page-creator` and `gatsby`
          // and install `gatsby` in example site project.
          (0, _getDependantPackages.getDependantPackages)({
            packageName,
            depTree,
            packagesToPublish: packages
          }).forEach(packageToPublish => {
            // scheduling publish - we will publish when `ready` is emitted
            // as we can do single publish then
            packagesToPublish.add(packageToPublish);
          });
        }
      }

      // don't ever copy package.json as this will mess up any future dependency
      // changes checks
      return;
    }
    const localCopies = [copyPath(filePath, newPath, quiet, packageName)];

    // If this is from "cache-dir" also copy it into the site's .cache
    if ((0, _includes2.default)(filePath, `cache-dir`)) {
      const newCachePath = _path.default.join(`.cache/`, _path.default.relative(_path.default.join(prefix, `cache-dir`), filePath));
      localCopies.push(copyPath(filePath, newCachePath, quiet, packageName));
    }
    allCopies = allCopies.concat(localCopies);
  }).on(`ready`, async () => {
    // wait for all async work needed to be done
    // before publishing / installing
    await Promise.all(Array.from(waitFor));
    if (isInitialScan) {
      isInitialScan = false;
      if (packagesToPublish.size > 0) {
        isPublishing = true;
        await (0, _index.publishPackagesLocallyAndInstall)({
          packagesToPublish: Array.from(packagesToPublish),
          packageNameToPath,
          localPackages,
          ignorePackageJSONChanges,
          externalRegistry,
          root,
          packageManager
        });
        packagesToPublish.clear();
        isPublishing = false;
      } else if (anyPackageNotInstalled) {
        // run `pnpm install`
        const pnpmInstallCmd = [`pnpm install`];
        console.log(`Installing packages from public NPM registry`);
        await (0, _promisifiedSpawn.promisifiedSpawn)(pnpmInstallCmd);
        console.log(`Installation complete`);
      }
      await clearJSFilesFromNodeModules();
      runQueuedCopies();
    }

    // all files watched, quit once all files are copied if necessary
    Promise.all(allCopies).then(() => {
      if (scanOnce) {
        quit();
      }
    });
  });
}