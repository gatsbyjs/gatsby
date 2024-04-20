/**
 * Recursively get set of packages that depend on given package.
 * Set also includes passed package.
 */
export function getDependantPackages({
  packageName,
  depTree,
  packagesToPublish = new Set<string>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: {
  packageName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  depTree: Record<string, Array<string>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packagesToPublish?: Set<string> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Set<string> {
  if (packagesToPublish.has(packageName)) {
    // bail early if package was already handled
    return packagesToPublish
  }

  packagesToPublish.add(packageName)

  const dependants = depTree[packageName]

  if (dependants) {
    dependants.forEach((dependant: string): Set<string> => {
      return getDependantPackages({
        packageName: dependant,
        depTree,
        packagesToPublish,
      })
    })
  }

  return packagesToPublish
}
