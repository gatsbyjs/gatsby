const path = require(`path`)
const _ = require(`lodash`)

const prepareOptions = babel => {
  let pluginBabelConfig = { test: { plugins: [], presets: [] } }
  if (process.env.NODE_ENV !== `test`) {
    const pluginBabelConfig = require(path.join(
      process.cwd(),
      `./.cache/babelState.json`
    ))
  }

  const stage = process.env.GATSBY_BUILD_STAGE || `test`

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
      [require.resolve(`@babel/plugin-syntax-dynamic-import`)],
      {
        type: `plugin`,
      }
    )
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
  console.log({ pluginBabelConfig, stage })
  console.log(pluginBabelConfig[stage])
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

// Export helper functions for testing
exports.prepareOptions = prepareOptions
exports.mergeConfigItemOptions = mergeConfigItemOptions
