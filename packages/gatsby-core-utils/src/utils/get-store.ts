import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

export function getStore(): unknown {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { store } = importFrom(gatsbyPkgRoot, `gatsby/dist/redux`) as any

  return store
}
