import { GatsbyNode } from "gatsby"
import path from "path"
import subfont from "subfont"

const onPostBuild: GatsbyNode["onPostBuild"] = async (
  { store, reporter },
  options
) => {
  const root = path.join(store.getState().program.directory, `public`)
  const subfontConsole = {
    log: reporter.info,
    warn: reporter.warn,
    error: reporter.error,
  }

  await subfont(
    {
      root,
      inPlace: true,
      inlineCss: true,
      silent: true,
      inputFiles: [path.join(root, `index.html`)],
      ...options,
    },
    subfontConsole
  )
}

export default { onPostBuild }
