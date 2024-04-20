"use strict";

exports.__esModule = true;
exports.getDependantPackages = getDependantPackages;
/**
 * Recursively get set of packages that depend on given package.
 * Set also includes passed package.
 */
function getDependantPackages({
  packageName,
  depTree,
  packagesToPublish = new Set()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  if (packagesToPublish.has(packageName)) {
    // bail early if package was already handled
    return packagesToPublish;
  }
  packagesToPublish.add(packageName);
  const dependants = depTree[packageName];
  if (dependants) {
    dependants.forEach(dependant => {
      return getDependantPackages({
        packageName: dependant,
        depTree,
        packagesToPublish
      });
    });
  }
  return packagesToPublish;
}