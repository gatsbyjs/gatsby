/**
 * Recursively get set of packages that depend on given package.
 * Set also includes passed package.
 */
const getDependentPackages = ({
  packageName,
  depTree,
  packagesToPublish = new Set(),
}) => {
  if (packagesToPublish.has(packageName)) {
    // bail early if package was already handled
    return packagesToPublish
  }

  packagesToPublish.add(packageName)
  const dependents = depTree[packageName]
  if (dependents) {
    dependents.forEach(dependent =>
      getDependentPackages({
        packageName: dependent,
        depTree,
        packagesToPublish,
      })
    )
  }

  return packagesToPublish
}

exports.getDependentPackages = getDependentPackages
