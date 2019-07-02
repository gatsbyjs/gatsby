import { store } from "../redux"
import rpt from "read-package-tree"

// Returns [Object] with name and path
module.exports = async () => {
  const { program } = store.getState()
  const allNodeModules = await rpt(program.directory, (node, moduleName) =>
    /gatsby/.test(moduleName)
  )
  return allNodeModules.children
}
