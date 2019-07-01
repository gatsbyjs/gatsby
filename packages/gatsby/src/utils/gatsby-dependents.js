const rpt = require(`read-package-tree`)

// Pass in baseDirectory from store.program.directory
module.exports = async baseDirectory => {
  const allNodeModules = await rpt(baseDirectory)
  return allNodeModules.children.filter(
    node =>
      (node.package.dependencies && node.package.dependencies[`gatsby`]) ||
      (node.package.peerDependencies && node.package.peerDependencies[`gatsby`])
  )
}
