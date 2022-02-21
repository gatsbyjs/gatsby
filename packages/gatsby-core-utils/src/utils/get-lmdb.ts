import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

export function getLmdb(): typeof import("lmdb") {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  // Try to use lmdb from gatsby if not we use our own version
  try {
    return importFrom(gatsbyPkgRoot, `lmdb`) as typeof import("lmdb")
  } catch (err) {
    return require(`lmdb`)
  }
}
