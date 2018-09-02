const path = require(`path`)
const _ = require(`lodash`)

const prepareOptions = (babel, resolve = require.resolve) => {
  let pluginBabelConfig = { test: { plugins: [], presets: [] } }
  if (process.env.NODE_ENV !== `test`) {
    pluginBabelConfig = require(path.join(
      process.cwd(),
      `./.cache/babelState.json`
    ))
  }

  const stage = process.env.GATSBY_BUILD_STAGE || `test`

  // Required plugins/presets
  const requiredPlugins = [
    babel.createConfigItem([resolve(`babel-plugin-remove-graphql-queries`)], {
      type: `plugin`,
    }),
  ]
  const requiredPresets = []

  // Stage specific plugins to add
  if (stage === `build-html` || stage === `develop-html`) {
    requiredPlugins.push(
      babel.createConfigItem([resolve(`babel-plugin-dynamic-import-node`)], {
        type: `plugin`,
      })
    )
  }

  if (stage === `develop`) {
    requiredPlugins.push(
      babel.createConfigItem([resolve(`react-hot-loader/babel`)], {
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
        resolve(`@babel/preset-env`),
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
        resolve(`@babel/preset-react`),
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

  fallbackPlugins.push(
    babel.createConfigItem(
      [
        resolve(`@babel/plugin-proposal-class-properties`),
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
    babel.createConfigItem([resolve(`babel-plugin-macros`)], {
      type: `plugin`,
    })
  )

  fallbackPlugins.push(
    babel.createConfigItem([resolve(`@babel/plugin-syntax-dynamic-import`)], {
      type: `plugin`,
    })
  )

  fallbackPlugins.push(
    babel.createConfigItem(
      [
        resolve(`@babel/plugin-transform-runtime`),
        {
          helpers: true,
          regenerator: true,
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
      babel.createConfigItem([resolve(plugin.name), plugin.options], {
        type: `plugin`,
      })
    )
  })
  pluginBabelConfig[stage].presets.forEach(preset => {
    reduxPresets.push(
      babel.createConfigItem([resolve(preset.name), preset.options], {
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
