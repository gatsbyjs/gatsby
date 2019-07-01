const util = require(`util`)
const readPackageTree = require(`read-package-tree`)
const readPackageTreeAsync = util.promisify(readPackageTree)

// Pass in baseDirectory from store.program.directory
module.exports = async baseDirectory => {
  const allNodeModules = await readPackageTreeAsync(baseDirectory, () => true)
  return allNodeModules.children.filter(
    node =>
      (node.package.dependencies && node.package.dependencies[`gatsby`]) ||
      (node.package.peerDependencies && node.package.peerDependencies[`gatsby`])
  )
}
