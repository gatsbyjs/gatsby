/**
 * Recursively get set of packages that depend on given package.
 * Set also includes passed package.
 */
const getDependantPackages = ({
  packageName,
  depTree,
  packagesToPublish = new Set(),
}) => {
  if (packagesToPublish.has(packageName)) {
    // bail early if package was already handled
    return packagesToPublish
  }

  packagesToPublish.add(packageName)
  const dependants = depTree[packageName]
  if (dependants) {
    dependants.forEach(dependant =>
      getDependantPackages({
        packageName: dependant,
        depTree,
        packagesToPublish,
      })
    )
  }

  return packagesToPublish
}

exports.getDependantPackages = getDependantPackages
