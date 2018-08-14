const babelLoader = require(`babel-loader`)
const path = require(`path`)

const prepareOptions = babel => {
  const pluginBabelConfig = require(path.join(
    process.cwd(),
    `./.cache/babelState.json`
  ))

  const stage = process.env.GATSBY_BUILD_STAGE

  // Required plugins/presets
  const requiredPlugins = [
    babel.createConfigItem(
      [require.resolve(`babel-plugin-remove-graphql-queries`)],
      {
        type: `plugin`,
      }
    ),
  ]
  const requiredPresets = []

  // Stage specific plugins to add
  if (stage === `build-html` || stage === `develop-html`) {
    requiredPlugins.push(
      babel.createConfigItem(
        [require.resolve(`babel-plugin-dynamic-import-node`)],
        {
          type: `plugin`,
        }
      )
    )
  }

  if (stage === `develop`) {
    requiredPlugins.push(
      babel.createConfigItem([require.resolve(`react-hot-loader/babel`)], {
        type: `plugin`,
      })
    )
  }

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

  return [reduxPresets, reduxPlugins, requiredPresets, requiredPlugins]
}

module.exports = babelLoader.custom(babel => {
  const toReturn = {
    // Passed the loader options.
    customOptions(options) {
      return {
        loader: {
          cacheDirectory: true,
          sourceType: `unambiguous`,
          ...options,
        },
      }
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig) {
      let { options } = partialConfig
      const [
        reduxPresets,
        reduxPlugins,
        requiredPresets,
        requiredPlugins,
      ] = prepareOptions(babel)

      // If there is no filesystem config present add more defaults
      // TODO: maybe this should be stricter, like checks if there are no plugins or presets?
      if (!partialConfig.hasFilesystemConfig()) {
        options = {
          ...options,
          plugins: [...reduxPlugins, ...requiredPlugins],
          presets: [...reduxPresets, ...requiredPresets],
        }
      } else {
        // Push on just our required plugins/presets
        options = {
          ...options,
          plugins: [...options.plugins, ...requiredPlugins],
          presets: [...options.presets, ...requiredPresets],
        }
      }

      return options
    },
  }

  return toReturn
})
