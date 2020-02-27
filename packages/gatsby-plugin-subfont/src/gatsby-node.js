const path = require(`path`)
const subfont = require(`subfont`)

exports.onPostBuild = async ({ store }, options) => {
  const root = path.join(store.getState().program.directory, `public`)

  await subfont(
    {
      root,
      inPlace: true,
      inlineCss: true,
      silent: true,
      inputFiles: [path.join(root, `index.html`)],
      ...options,
    },
    console
  )
  return
}
