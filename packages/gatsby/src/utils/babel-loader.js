const babelLoader = require(`babel-loader`)
const path = require(`path`)
const fs = require(`fs`)

const prepareOptions = babel => {
  const pluginBabelConfig = require(path.join(
    process.cwd(),
    `./.cache/babelState.json`
  ))

  const stage = fs.readFileSync(
    path.join(process.cwd(), `./.cache/current-stage.txt`),
    `utf8`
  )

  // Go through babel state and create config items.
  const reduxPlugins = []
  const reduxPresets = []
  pluginBabelConfig[stage].plugins.forEach(plugin => {
    reduxPlugins.push(
      babel.createConfigItem([require.resolve(plugin.name), plugin.options], {
        type: `plugin`,
      })
    )
  })
  pluginBabelConfig[stage].presets.forEach(preset => {
    reduxPresets.push(
      babel.createConfigItem([require.resolve(preset.name), preset.options], {
        type: `preset`,
      })
    )
  })

  return [reduxPresets, reduxPlugins]
}

module.exports = babelLoader.custom(babel => {
  const toReturn = {
    // Passed the loader options.
    customOptions(options) {
      return {
        loader: {
          cacheDirectory: true,
          babelrc: false,
          sourceType: `unambiguous`,
          ...options,
        },
      }
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig) {
      let { options } = partialConfig

      // If there is no filesystem config present add more defaults
      // TODO: maybe this should be stricter, like checkks if there are no plugins or presets?
      // TODO: this could be in an internal plugin like it is currently
      if (!partialConfig.hasFilesystemConfig()) {
        const [reduxPresets, reduxPlugins] = prepareOptions(babel)
        options = {
          ...options,
          plugins: reduxPlugins,
          presets: reduxPresets,
        }
      }

      return options
    },
  }

  return toReturn
})
