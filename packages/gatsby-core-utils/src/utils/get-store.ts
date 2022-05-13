import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

export function getStore(): typeof import("gatsby/src/redux")["store"] {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  const { store } = importFrom(
    gatsbyPkgRoot,
    `gatsby/dist/redux`
  ) as typeof import("gatsby/src/redux")

  return store
}
