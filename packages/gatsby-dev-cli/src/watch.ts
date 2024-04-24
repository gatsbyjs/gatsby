import chokidar from "chokidar";
// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash";
import del from "del";
import fs from "fs-extra";
import path from "path";
import findWorkspaceRoot from "find-yarn-workspace-root";

import { publishPackagesLocallyAndInstall } from "./local-npm-registry/index";
import { checkDepsChanges } from "./utils/check-deps-changes";
// @ts-ignore
import { getDependantPackages } from "./utils/get-dependant-packages";
import {
  setDefaultSpawnStdio,
  promisifiedSpawn,
} from "./utils/promisified-spawn";
import { traversePackagesDeps } from "./utils/traverse-package-deps";

let numCopied = 0;

function quit(): void {
  console.log(`Copied ${numCopied} files`);
  process.exit();
}

const MAX_COPY_RETRIES = 3;

/*
 * non-existent packages break on('ready')
 * See: https://github.com/paulmillr/chokidar/issues/449
 */
export async function watch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root: any,
  packages: Set<string> | undefined,
  {
    scanOnce,
    quiet,
    forceInstall,
    monoRepoPackages,
    localPackages,
    packageNameToPath,
    externalRegistry,
    packageManager,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any,
): Promise<void> {
  setDefaultSpawnStdio(quiet ? "ignore" : "inherit");
  // determine if in yarn workspace - if in workspace, force using verdaccio
  // as current logic of copying files will not work correctly.
  const yarnWorkspaceRoot = findWorkspaceRoot();
  if (yarnWorkspaceRoot && process.env.NODE_ENV !== "test") {
    console.log("Yarn workspace found.");
    forceInstall = true;
  }

  let afterPackageInstallation = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queuedCopies: Array<any> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function realCopyPath(arg: any): void {
    const { oldPath, newPath, quiet, resolve, reject, retry = 0 } = arg;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fs.copy(oldPath, newPath, (err: any) => {
      if (err) {
        if (retry >= MAX_COPY_RETRIES) {
          console.error(err);
          reject(err);
          return;
        } else {
          globalThis.setTimeout(
            () => {
              return realCopyPath({ ...arg, retry: retry + 1 });
            },
            500 * Math.pow(2, retry),
          );
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
        fs.chmodSync(newPath, "0755");
      }

      numCopied += 1;
      if (!quiet) {
        console.log(`Copied ${oldPath} to ${newPath}`);
      }
      resolve();
    });
  }

  function copyPath(
    oldPath: string,
    newPath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quiet: any,
    packageName: undefined,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const argObj = { oldPath, newPath, quiet, packageName, resolve, reject };

      if (afterPackageInstallation) {
        realCopyPath(argObj);
      } else {
        queuedCopies.push(argObj);
      }
    });
  }

  function runQueuedCopies(): void {
    afterPackageInstallation = true;
    queuedCopies.forEach((argObj) => realCopyPath(argObj));
    queuedCopies = [];
  }

  async function clearJSFilesFromNodeModules(): Promise<void> {
    const packagesToClear = queuedCopies.reduce((acc, { packageName }) => {
      if (packageName) {
        acc.add(packageName);
      }
      return acc;
    }, new Set());

    await Promise.all(
      [...packagesToClear].map(
        async (packageToClear) =>
          await del.deleteAsync([
            `node_modules/${packageToClear}/**/*.{js,js.map}`,
            `!node_modules/${packageToClear}/node_modules/**/*.{js,js.map}`,
            `!node_modules/${packageToClear}/src/**/*.{js,js.map}`,
          ]),
      ),
    );
  }
  // check packages deps and if they depend on other packages from monorepo
  // add them to packages list
  const { seenPackages, depTree } = traversePackagesDeps({
    // root,
    packages: _.uniq(localPackages),
    monoRepoPackages,
    packageNameToPath,
  });

  const allPackagesToWatch: Array<string> = packages
    ? _.intersection<string>(Array.from(packages), seenPackages)
    : seenPackages;

  const ignoredPackageJSON = new Map();

  function ignorePackageJSONChanges(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    packageName: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentArray: any,
  ): () => void {
    ignoredPackageJSON.set(packageName, contentArray);

    return () => {
      ignoredPackageJSON.delete(packageName);
    };
  }

  if (forceInstall) {
    try {
      if (allPackagesToWatch.length > 0) {
        await publishPackagesLocallyAndInstall({
          packagesToPublish: allPackagesToWatch,
          packageNameToPath,
          localPackages,
          ignorePackageJSONChanges,
          yarnWorkspaceRoot,
          externalRegistry,
          root,
          packageManager,
        });
      } else {
        // run `pnpm install`
        const pnpmInstallCmd = ["pnpm install"] as [string];

        console.log("Installing packages from public NPM registry");
        await promisifiedSpawn(pnpmInstallCmd);
        console.log("Installation complete");
      }
    } catch (e) {
      console.log(e);
    }

    process.exit();
  }

  if (allPackagesToWatch.length === 0) {
    console.error("There are no packages to watch.");
    return;
  }

  const allPackagesIgnoringThemesToWatch: Array<string> =
    allPackagesToWatch.filter(
      (pkgName: string): boolean => !pkgName.startsWith("gatsby-theme"),
    );

  const ignored = [
    /[/\\]node_modules[/\\]/i,
    /\.git/i,
    /\.DS_Store/,
    /[/\\]__tests__[/\\]/i,
    /[/\\]__mocks__[/\\]/i,
    /\.npmrc/i,
  ].concat(
    allPackagesIgnoringThemesToWatch.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, "i"),
    ),
  );
  const watchers: Array<string> = _.uniq(
    allPackagesToWatch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => path.join(packageNameToPath.get(p)))
      .filter((p: fs.PathLike) => fs.existsSync(p)),
  );

  let allCopies: Array<Promise<unknown>> = [];

  const packagesToPublish = new Set<string>();
  let isInitialScan = true;
  let isPublishing = false;

  const waitFor = new Set();
  let anyPackageNotInstalled = false;

  const watchEvents = ["change", "add"];
  const packagePathMatchingEntries = Array.from(packageNameToPath.entries());

  chokidar
    .watch(watchers, {
      ignored: [
        (filePath: string): boolean => {
          return _.some(ignored, (reg: RegExp): boolean => {
            return reg.test(filePath);
          });
        },
      ],
    })
    .on("all", async (event, filePath) => {
      if (!watchEvents.includes(event)) {
        return;
      }

      // match against paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let packageName: any;

      // @ts-ignore
      for (const [_packageName, packagePath] of packagePathMatchingEntries) {
        const relativeToThisPackage = path.relative(packagePath, filePath);
        if (!relativeToThisPackage.startsWith("..")) {
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
      if (_.includes(filePath, "dist/gatsby-cli.js")) {
        return;
      }

      const relativePackageFile = path.relative(prefix, filePath);

      const newPath = path.join(
        `./node_modules/${packageName}`,
        relativePackageFile,
      );

      if (relativePackageFile === "package.json") {
        // package.json files will change during publish to adjust version of package (and dependencies), so ignore
        // changes during this process
        if (isPublishing) {
          return;
        }

        // Compare dependencies with local version

        const didDepsChangedPromise = checkDepsChanges({
          newPath,
          packageName,
          monoRepoPackages,
          packageNameToPath,
          isInitialScan,
          ignoredPackageJSON,
        });

        if (isInitialScan) {
          // normally checkDepsChanges would be sync,
          // but because it also can do async GET request
          // to unpkg if local package is not installed
          // keep track of it to make sure all of it
          // finish before installing

          waitFor.add(didDepsChangedPromise);
        }

        const { didDepsChanged, packageNotInstalled } =
          await didDepsChangedPromise;

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
            getDependantPackages({
              packageName,
              depTree,
              packagesToPublish: packages,
            }).forEach((packageToPublish: string) => {
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

      const localCopies: Array<Promise<unknown>> = [
        copyPath(filePath, newPath, quiet, packageName),
      ];

      // If this is from "cache-dir" also copy it into the site's .cache
      if (_.includes(filePath, "cache-dir")) {
        const newCachePath = path.join(
          ".cache/",
          path.relative(path.join(prefix, "cache-dir"), filePath),
        );
        localCopies.push(copyPath(filePath, newCachePath, quiet, packageName));
      }

      allCopies = allCopies.concat(localCopies);
    })
    .on("ready", async () => {
      // wait for all async work needed to be done
      // before publishing / installing
      await Promise.all(Array.from(waitFor));

      if (isInitialScan) {
        isInitialScan = false;
        if (packagesToPublish.size > 0) {
          isPublishing = true;
          await publishPackagesLocallyAndInstall({
            packagesToPublish: Array.from(packagesToPublish),
            packageNameToPath,
            localPackages,
            ignorePackageJSONChanges,
            externalRegistry,
            root,
            packageManager,
          });
          packagesToPublish.clear();
          isPublishing = false;
        } else if (anyPackageNotInstalled) {
          // run `pnpm install`
          const pnpmInstallCmd = ["pnpm install"] as [string];

          console.log("Installing packages from public NPM registry");
          await promisifiedSpawn(pnpmInstallCmd);
          console.log("Installation complete");
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
