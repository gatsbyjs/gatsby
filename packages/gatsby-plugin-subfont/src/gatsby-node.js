const path = require(`path`)
const subfont = require(`subfont`)

exports.onPostBuild = async ({ store, reporter }, options) => {
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
