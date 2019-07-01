const util = require(`util`)
const readPackageTree = require(`read-package-tree`)
const readPackageTreeAsync = util.promisify(readPackageTree)

module.exports = async () => {
  const allNodeModules = await readPackageTreeAsync(this.base, () => true)
  return allNodeModules.children.filter(
    node =>
      (node.package.dependencies && node.package.dependencies[`gatsby`]) ||
      (node.package.peerDependencies && node.package.peerDependencies[`gatsby`])
  )
}
