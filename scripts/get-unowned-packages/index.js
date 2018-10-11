const { getPackages } = require(`@lerna/project`)
const PackageGraph = require(`@lerna/package-graph`)
const filterPackages = require(`@lerna/filter-packages`)
const util = require(`util`)
const path = require(`path`)
const exec = util.promisify(require(`child_process`).exec)

const getPackagesWithReadWriteAccess = async user => {
  const cmd = `npm access ls-packages ${user}`
  const { stdout } = await exec(cmd)
  const permissions = JSON.parse(stdout)
  return Object.entries(permissions).reduce((lookup, [pkgName, access]) => {
    if (access === `read-write`) {
      lookup[pkgName] = pkgName
    }
    return lookup
  }, {})
}

module.exports = function getUnownedPackages({
  rootPath = path.join(__dirname, `../..`),
  user,
} = {}) {
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

    // infer user from npm whoami
    // set registry because yarn run hijacks registry
    if (!user) {
      user = await exec(`npm whoami --registry https://registry.npmjs.org`)
        .then(({ stdout }) => stdout.trim())
        .catch(() => process.exit(1))
    }

    const alreadyOwnedPackages = await getPackagesWithReadWriteAccess(user)

    const publicGatsbyPackagesWithoutAccess = publicGatsbyPackages.filter(
      pkg => !alreadyOwnedPackages[pkg.name]
    )

    return {
      packages: publicGatsbyPackagesWithoutAccess,
      user,
    }
  })
}
