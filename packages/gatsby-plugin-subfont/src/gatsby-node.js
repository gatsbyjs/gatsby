const path = require(`path`)
const subfont = require(`subfont`)

exports.onPostBuild = async ({ store }, options) => {
  const root = path.join(store.getState().program.directory, `public`)

  const urlPaths = [`/`]

  await subfont(
    {
      root: `file://${root}`,
      inPlace: true,
      inlineCss: true,
      silent: true,
      inputFiles: urlPaths.map(currentPath =>
        path.join(root, currentPath, `index.html`)
      ),
      ...options,
    },
    console
  )
  return
}
