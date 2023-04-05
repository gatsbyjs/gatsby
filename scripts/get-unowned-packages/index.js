const { getPackages } = require(`@lerna/project`)
const PackageGraph = require(`@lerna/package-graph`)
const filterPackages = require(`@lerna/filter-packages`)
const util = require(`util`)
const path = require(`path`)
const { exec, execSync } = require(`child_process`)

const execP = util.promisify(exec)

const getPackagesWithReadWriteAccess = async user => {
  // Requires npm 9.0.0 or higher
  const cmd = `npm access list packages ${user} --json`
  const { stdout } = await execP(cmd)
  const permissions = JSON.parse(stdout)
  return Object.entries(permissions).reduce((lookup, [pkgName, access]) => {
    if (access === `read-write`) {
      lookup[pkgName] = pkgName
    }
    return lookup
  }, {})
}

module.exports = async function getUnownedPackages({
  rootPath = path.join(__dirname, `../..`),
  user,
} = {}) {
  // infer user from npm whoami
  // set registry because yarn run hijacks registry
  if (!user) {
    user = await execP(
      `"node_modules/.bin/cross-env" npm_config_username="" npm whoami --registry https://registry.npmjs.org`
    )
      .then(({ stdout }) => stdout.trim())
      .catch(err => {
        throw new Error(`You are not logged-in`)
      })
  }

  return getPackages(rootPath).then(async packages => {
    const graph = new PackageGraph(packages, `dependencies`, true)

    // filter out private packages
    // adding owner to private packages will fail, because package doesn't exist
    const publicGatsbyPackages = filterPackages(
      graph.rawPackageList,
      [],
      [],
      false
    )

    const alreadyOwnedPackages = await getPackagesWithReadWriteAccess(user)

    const publicGatsbyPackagesWithoutAccess = publicGatsbyPackages.filter(
      pkg => {
        if (alreadyOwnedPackages[pkg.name]) {
          return false
        }

        try {
          return !execSync(`npm view ${pkg.name} version`, { stdio: `pipe` })
            .stderr
        } catch (e) {
          return false
        }
      }
    )

    return {
      packages: publicGatsbyPackagesWithoutAccess,
      user,
    }
  })
}
