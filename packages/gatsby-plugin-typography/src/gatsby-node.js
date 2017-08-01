const fs = require(`fs`)
const path = require(`path`)

// Write out a typography module to .cache.

// TODO add a new API hook e.g onPreBootstrap
exports.sourceNodes = ({ store }, pluginOptions) => {
  const program = store.getState().program

  let module
  if (pluginOptions.pathToConfigModule) {
    module = `module.exports = require("${path.join(
      program.directory,
      pluginOptions.pathToConfigModule
    )}")`
  } else {
    module = `const Typography = require("typography")
const typography = new Typography()
module.exports = typography`
  }

  const dir = `${__dirname}/.cache`

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFileSync(`${dir}/typography.js`, module)
}
