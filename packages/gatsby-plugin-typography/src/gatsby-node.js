const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)

// Write out a typography module to the cache.

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

  if (!fs.existsSync(cache.rootDirectory)) {
    fs.mkdirSync(cache.rootDirectory)
  }

  fs.writeFileSync(`${cache.rootPath(`typography.js`)}`, module)
}
