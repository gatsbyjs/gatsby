const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)

const getCachePath = directory =>
  path.join(directory, `.cache`, `caches`, `gatsby-plugin-typography`)

// Write out a typography module to .cache.

exports.onPreBootstrap = ({ store }, pluginOptions) => {
  const program = store.getState().program

  let module
  if (pluginOptions.pathToConfigModule) {
    module = `module.exports = require("${
      path.isAbsolute(pluginOptions.pathToConfigModule)
        ? pluginOptions.pathToConfigModule
        : path.join(program.directory, pluginOptions.pathToConfigModule)
    }")`
    if (os.platform() === `win32`) {
      module = module.split(`\\`).join(`\\\\`)
    }
  } else {
    module = `const Typography = require("typography")
const typography = new Typography()
module.exports = typography`
  }

  // const dir = `${__dirname}/.cache`
  const dir = getCachePath(program.directory)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFileSync(`${dir}/typography.js`, module)
}

exports.onCreateWebpackConfig = ({ actions, plugins: { define }, store }) => {
  const cache = path.join(
    getCachePath(store.getState().program.directory),
    `typography.js`
  )
  const { setWebpackConfig } = actions
  setWebpackConfig({
    plugins: [
      define({
        __TYPOGRAPHY_PLUGIN_CACHE_ENDPOINT__: JSON.stringify(cache),
      }),
    ],
  })
}
