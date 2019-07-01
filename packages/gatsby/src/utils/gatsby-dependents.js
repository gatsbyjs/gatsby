import { store } from "../redux"
import rpt from "read-package-tree"

// Returns [Object] with name and path
module.exports = async () => {
  const { program } = store.getState()
  const allNodeModules = await rpt(program.directory)
  return allNodeModules.children.filter(
    node =>
      (node.package.dependencies && node.package.dependencies[`gatsby`]) ||
      (node.package.peerDependencies && node.package.peerDependencies[`gatsby`])
  )
}
