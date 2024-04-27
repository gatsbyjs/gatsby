#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash";
import Configstore from "configstore";
import pkg from "../package.json";
import path from "node:path";
import os from "node:os";
import { watch } from "./watch";
import { getVersionInfo } from "./utils/version";
import argv from "yargs";
import fs from "fs-extra";
import type { PackageJson } from "../../gatsby";

// eslint-disable-next-line @babel/no-unused-expressions
argv
  .usage("Usage: gatsby-dev [options]")
  .alias("q", "quiet")
  .nargs("q", 0)
  .describe("q", "Do not output copy file information")
  .alias("s", "scan-once")
  .nargs("s", 0)
  .describe("s", "Scan once. Do not start file watch")
  .alias("p", "set-path-to-repo")
  .nargs("p", 1)
  .describe(
    "p",
    `Set path to Gatsby repository.
You typically only need to configure this once.`,
  )
  .nargs("force-install", 0)
  .describe(
    "force-install",
    "Disables copying files into node_modules and forces usage of local npm repository.",
  )
  .nargs("external-registry", 0)
  .describe(
    "external-registry",
    "Run 'pnpm add' commands without the --registry flag.",
  )
  .alias("C", "copy-all")
  .nargs("C", 0)
  .describe(
    "C",
    "Copy all contents in packages/ instead of just gatsby packages",
  )
  .array("packages")
  .describe("packages", "Explicitly specify packages to copy")
  .help("h")
  .alias("h", "help")
  .nargs("v", 0)
  .alias("v", "version")
  .describe("v", "Print the currently installed version of Gatsby Dev CLI")
  .choices("package-manager", ["pnpm", "npm"])
  .default("package-manager", "pnpm")
  .describe(
    "package-manager",
    "Package manager to use for installing dependencies.",
  ).argv;

if (argv.version) {
  console.log(getVersionInfo());
  process.exit();
}

const conf = new Configstore(pkg.name);

let pathToRepo = argv.setPathToRepo;

if (pathToRepo) {
  if (pathToRepo.includes("~")) {
    pathToRepo = path.join(os.homedir(), pathToRepo.split("~").pop());
  }
  conf.set("gatsby-location", path.resolve(pathToRepo));
  process.exit();
}

const havePackageJsonFile = fs.existsSync("package.json");

if (!havePackageJsonFile) {
  console.error("Current folder must have a package.json file!");
  process.exit();
}

const gatsbyLocation = conf.get("gatsby-location");

if (!gatsbyLocation) {
  console.error(
    `
You haven't set the path yet to your cloned
version of Gatsby. Do so now by running:

gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
`,
  );
  process.exit();
}

// get list of packages from monorepo
const packageNameToPath = new Map();
const monoRepoPackages = fs
  .readdirSync(path.join(gatsbyLocation, "packages"))
  .map((dirName) => {
    try {
      const filePath = path.join(
        gatsbyLocation,
        "packages",
        dirName,
        "package.json",
      );

      const file = fs.readFileSync(filePath).toString();

      const localPkg = JSON.parse(file) as PackageJson;

      if (localPkg?.name) {
        packageNameToPath.set(
          localPkg.name,
          path.join(gatsbyLocation, "packages", dirName),
        );
        return localPkg.name;
      }
    } catch (error) {
      // fallback to generic one
    }

    packageNameToPath.set(
      dirName,
      path.join(gatsbyLocation, "packages", dirName),
    );
    return dirName;
  });

const file = fs.readFileSync("package.json").toString();

const localPkg = JSON.parse(file) as PackageJson;

// intersect dependencies with monoRepoPackages to get list of packages that are used
const localPackages = _.intersection(
  monoRepoPackages,
  Object.keys(_.merge({}, localPkg.dependencies, localPkg.devDependencies)),
);

if (!argv.packages && _.isEmpty(localPackages)) {
  console.error(
    `
You haven't got any gatsby dependencies into your current package.json

You probably want to pass in a list of packages to start
developing on! For example:

gatsby-dev --packages gatsby gatsby-transformer-remark

If you prefer to place them in your package.json dependencies instead,
gatsby-dev will pick them up.
`,
  );
  if (!argv.forceInstall) {
    process.exit();
  } else {
    console.log(
      'Continuing other dependencies installation due to "--forceInstall" flag',
    );
  }
}

watch(gatsbyLocation, argv.packages, {
  localPackages,
  quiet: argv.quiet,
  scanOnce: argv.scanOnce,
  forceInstall: argv.forceInstall,
  monoRepoPackages,
  packageNameToPath,
  externalRegistry: argv.externalRegistry,
  packageManager: argv.packageManager,
});
