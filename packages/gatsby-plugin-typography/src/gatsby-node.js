const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)

// Write out a typography module to .cache.

exports.onPreBootstrap = ({ store, cache }, pluginOptions) => {
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

  const dir = cache.directory

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFileSync(path.join(dir, `typography.js`), module)
}

exports.onCreateWebpackConfig = ({ actions, cache }) => {
  const cacheFile = path.join(cache.directory, `typography.js`)
  const { setWebpackConfig } = actions
  setWebpackConfig({
    resolve: {
      alias: {
        "typography-plugin-cache-endpoint": cacheFile,
      },
    },
  })
}
