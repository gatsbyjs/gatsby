const path = require(`path`)
const _ = require(`lodash`)

const loadCachedConfig = () => {
  let pluginBabelConfig = {
    stages: {
      test: { plugins: [], presets: [] },
    },
  }
  if (process.env.NODE_ENV !== `test`) {
    pluginBabelConfig = require(path.join(
      process.cwd(),
      `./.cache/babelState.json`
    ))
  }
  return pluginBabelConfig
}

const getCustomOptions = stage => {
  const pluginBabelConfig = loadCachedConfig()
  return pluginBabelConfig.stages[stage].options
}

const prepareOptions = (babel, options = {}, resolve = require.resolve) => {
  const pluginBabelConfig = loadCachedConfig()

  const { stage, reactRuntime } = options

  // Required plugins/presets
  const requiredPlugins = [
    babel.createConfigItem(
      [
        resolve(`babel-plugin-remove-graphql-queries`),
        { stage, staticQueryDir: `page-data/sq/d` },
      ],
      {
        type: `plugin`,
      }
    ),
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
      babel.createConfigItem([resolve(`react-refresh/babel`)], {
        type: `plugin`,
      })
    )
  }

  // Fallback preset
  const fallbackPresets = []

  fallbackPresets.push(
    babel.createConfigItem(
      [
        resolve(`babel-preset-gatsby`),
        {
          stage,
          reactRuntime,
        },
      ],
      {
        type: `preset`,
      }
    )
  )

  // Go through babel state and create config items for presets/plugins from.
  const reduxPlugins = []
  const reduxPresets = []
  pluginBabelConfig.stages[stage].plugins.forEach(plugin => {
    reduxPlugins.push(
      babel.createConfigItem([resolve(plugin.name), plugin.options], {
        name: plugin.name,
        type: `plugin`,
      })
    )
  })
  pluginBabelConfig.stages[stage].presets.forEach(preset => {
    reduxPresets.push(
      babel.createConfigItem([resolve(preset.name), preset.options], {
        name: preset.name,
        type: `preset`,
      })
    )
  })

  return [
    reduxPresets,
    reduxPlugins,
    requiredPresets,
    requiredPlugins,
    fallbackPresets,
  ]
}

const addRequiredPresetOptions = (
  babel,
  presets,
  options = {},
  resolve = require.resolve
) => {
  // Always pass `stage` option to babel-preset-gatsby
  //  (even if defined in custom babelrc)
  const gatsbyPresetResolved = resolve(`babel-preset-gatsby`)
  const index = presets.findIndex(p => p.file.resolved === gatsbyPresetResolved)

  if (index !== -1) {
    presets[index] = babel.createConfigItem(
      [
        gatsbyPresetResolved,
        { ...presets[index].options, stage: options.stage },
      ],
      { type: `preset` }
    )
  }
  return presets
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

exports.getCustomOptions = getCustomOptions

// Export helper functions for testing
exports.prepareOptions = prepareOptions
exports.mergeConfigItemOptions = mergeConfigItemOptions
exports.addRequiredPresetOptions = addRequiredPresetOptions
