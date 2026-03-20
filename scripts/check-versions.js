const semver = require(`semver`)
const {
  getWorkspacePackages,
  getWorkspacePackageMap,
  restoreWorkspaceProtocol,
  stripWorkspaceProtocol,
  writeJson,
} = require(`./utils/workspace`)

const argv = require(`yargs`)
  .option(`fix`, {
    default: false,
    describe: `Fixes outdated dependencies`,
  })
  .option(`allow-next`, {
    default: false,
    describe: `Allow using "next" versions. Use this only for alpha/beta releases`,
  }).argv

const packages = getWorkspacePackages()
const packageMap = getWorkspacePackageMap(packages)
let warned = false

for (const pkg of packages) {
  const outdated = []

  for (const field of [
    `dependencies`,
    `devDependencies`,
    `peerDependencies`,
    `optionalDependencies`,
  ]) {
    for (const [depName, depRange] of Object.entries(
      pkg.packageJson[field] || {}
    )) {
      const localDependency = packageMap.get(depName)
      if (!localDependency) {
        continue
      }

      const normalizedRange = stripWorkspaceProtocol(depRange)

      if (
        !semver.satisfies(localDependency.version, normalizedRange, {
          includePrerelease: true,
        })
      ) {
        if (argv[`allow-next`] && normalizedRange === `next`) {
          continue
        }

        outdated.push({
          field,
          name: depName,
          fetchSpec: depRange,
          normalizedRange,
          version: localDependency.version,
        })
      }
    }
  }

  if (outdated.length === 0) {
    continue
  }

  const message = outdated
    .map(
      dependency =>
        `  Depends on "${dependency.name}@${dependency.fetchSpec}" \n` +
        `  instead of "${dependency.name}@${dependency.version}". \n`
    )
    .join(`\n`)

  console.error(`${pkg.name}: \n${message}`)
  warned = true

  if (argv.fix) {
    const nextPackageJson = JSON.parse(JSON.stringify(pkg.packageJson))
    for (const dependency of outdated) {
      if (nextPackageJson[dependency.field]?.[dependency.name]) {
        nextPackageJson[dependency.field][dependency.name] =
          restoreWorkspaceProtocol(
            dependency.fetchSpec,
            `^${dependency.version}`
          )
      }
    }

    writeJson(pkg.packageJsonPath, nextPackageJson)
  }
}

if (warned) {
  process.exit(1)
}
