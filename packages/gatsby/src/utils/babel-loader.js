const babelLoader = require(`babel-loader`)
const path = require(`path`)
const _ = require(`lodash`)

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

  // Fallback presets/plugins
  const fallbackPresets = []
  const fallbackPlugins = []

  let targets
  if (stage === `build-html`) {
    targets = {
      node: `current`,
    }
  } else {
    targets = {
      browsers: pluginBabelConfig.browserslist,
    }
  }

  fallbackPresets.push(
    babel.createConfigItem(
      [
        require.resolve(`@babel/preset-env`),
        {
          loose: true,
          modules: false,
          useBuiltIns: `usage`,
          targets,
        },
      ],
      {
        type: `preset`,
      }
    )
  )

  fallbackPresets.push(
    babel.createConfigItem(
      [
        require.resolve(`@babel/preset-react`),
        {
          useBuiltIns: true,
          pragma: `React.createElement`,
          development: stage === `develop`,
        },
      ],
      {
        type: `preset`,
      }
    )
  )

  fallbackPresets.push(
    babel.createConfigItem([require.resolve(`@babel/preset-flow`)], {
      type: `preset`,
    })
  )

  fallbackPlugins.push(
    babel.createConfigItem(
      [
        require.resolve(`@babel/plugin-proposal-class-properties`),
        {
          loose: true,
        },
      ],
      {
        type: `plugin`,
      }
    )
  )

  fallbackPlugins.push(
    babel.createConfigItem([require.resolve(`babel-plugin-macros`)], {
      type: `plugin`,
    })
  )

  fallbackPlugins.push(
    babel.createConfigItem(
      [
        require.resolve(`@babel/plugin-transform-runtime`),
        {
          helpers: true,
          regenerator: true,
          polyfill: false,
        },
      ],
      {
        type: `plugin`,
      }
    )
  )

  // Go through babel state and create config items for presets/plugins from.
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

  return [
    reduxPresets,
    reduxPlugins,
    requiredPresets,
    requiredPlugins,
    fallbackPlugins,
    fallbackPresets,
  ]
}

const mergeConfigItemOptions = ({ items, itemToMerge, type, babel }) => {
  const index = _.findIndex(
    items,
    i => i.file.resolved === itemToMerge.file.resolved
  )

  // If this exist, merge the options, otherwise, add it to the array
  if (index !== -1) {
    items[index] = babel.createConfigItem(
      [
        itemToMerge.file.resolved,
        _.merge({}, items[index].options, itemToMerge.options),
      ],
      {
        type,
      }
    )
  } else {
    items.push(itemToMerge)
  }

  return items
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
        fallbackPlugins,
        fallbackPresets,
      ] = prepareOptions(babel)

      // If there is no filesystem config present add more defaults
      // TODO: maybe this should be stricter, like checks if there are no plugins or presets?
      if (!partialConfig.hasFilesystemConfig()) {
        options = {
          ...options,
          plugins: [...fallbackPlugins, ...requiredPlugins],
          presets: [...fallbackPresets, ...requiredPresets],
        }
      } else {
        // Push on just our required plugins/presets
        options = {
          ...options,
          plugins: [...options.plugins, ...requiredPlugins],
          presets: [...options.presets, ...requiredPresets],
        }
      }

      // Merge in presets/plugins from gatsby plugins.
      reduxPresets.forEach(preset => {
        options.presets = mergeConfigItemOptions({
          items: options.presets,
          itemToMerge: preset,
          type: `preset`,
          babel,
        })
      })
      reduxPlugins.forEach(plugin => {
        options.plugins = mergeConfigItemOptions({
          items: options.plugins,
          itemToMerge: plugin,
          type: `plugin`,
          babel,
        })
      })

      return options
    },
  }

  return toReturn
})
