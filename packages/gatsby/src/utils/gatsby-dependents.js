import { store } from "../redux"
import rpt from "read-package-tree"
import { promisify } from "util"

const rptAsync = promisify(rpt)
// Returns [Object] with name and path
module.exports = async () => {
  const { program } = store.getState()
  const allNodeModules = await rptAsync(
    program.directory,
    // Include anything that has `gatsby` in its name but not `gatsby` itself
    (node, moduleName) => /gatsby/.test(moduleName) && moduleName !== `gatsby`
  )
  return allNodeModules.children
}
