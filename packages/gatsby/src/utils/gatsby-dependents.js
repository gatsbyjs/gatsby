import { store } from "../redux"
import { memoize } from "lodash"
import rpt from "read-package-tree"
import { promisify } from "util"

const rptAsync = promisify(rpt)
// Returns [Object] with name and path
module.exports = memoize(async () => {
  const { program } = store.getState()
  const allNodeModules = await rptAsync(program.directory, (node, moduleName) =>
    /gatsby/.test(moduleName)
  )
  return allNodeModules.children
})
