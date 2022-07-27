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

/**
 * https://babeljs.io/docs/en/babel-core#createconfigitem
 * If this function is called multiple times for a given plugin,
 * Babel will call the plugin's function itself multiple times.
 * If you have a clear set of expected plugins and presets to inject,
 * pre-constructing the config items would be recommended.
 */
const configItemsMemoCache = new Map()

const prepareOptions = (
  babel,
  customOptions = {},
  resolve = require.resolve
) => {
  const {
    stage,
    reactRuntime,
    reactImportSource,
    isPageTemplate,
    resourceQuery,
  } = customOptions

  const configItemsMemoCacheKey = `${stage}-${isPageTemplate}-${resourceQuery}`

  if (configItemsMemoCache.has(configItemsMemoCacheKey)) {
    return configItemsMemoCache.get(configItemsMemoCacheKey)
  }

  const pluginBabelConfig = loadCachedConfig()

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

  if (
    _CFLAGS_.GATSBY_MAJOR === `4` &&
    (stage === `develop` || stage === `build-javascript`) &&
    isPageTemplate
  ) {
    const apis = [`getServerData`, `config`]

    if (resourceQuery === `?export=default`) {
      apis.push(`Head`)
    }

    if (resourceQuery === `?export=head`) {
      apis.push(`default`)
    }

    requiredPlugins.push(
      babel.createConfigItem(
        [
          resolve(`./babel/babel-plugin-remove-api`),
          {
            apis,
          },
        ],
        {
          type: `plugin`,
        }
      )
    )
  }

  const requiredPresets = []

  // Stage specific plugins to add
  if (
    _CFLAGS_.GATSBY_MAJOR !== `4` &&
    (stage === `build-html` || stage === `develop-html`)
  ) {
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
          reactImportSource,
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

  const toReturn = [
    reduxPresets,
    reduxPlugins,
    requiredPresets,
    requiredPlugins,
    fallbackPresets,
  ]

  configItemsMemoCache.set(configItemsMemoCacheKey, toReturn)

  return toReturn
}

function convertCustomPresetsToPlugins(
  babel,
  { presets, plugins },
  options,
  resolve = require.resolve,
  { presetsToReturn, pluginsToReturn } = {
    presetsToReturn: [],
    pluginsToReturn: [],
  }
) {
  if (plugins && Array.isArray(plugins) && plugins.length > 0) {
    pluginsToReturn.push(...plugins)
  }

  const gatsbyPresetResolved = resolve(`babel-preset-gatsby`)

  if (presets && Array.isArray(presets) && presets.length > 0) {
    for (const preset of presets) {
      if (preset.file.resolved === gatsbyPresetResolved) {
        // make sure we are passing needed options
        const presetWithRequiredOptions = babel.createConfigItem(
          [
            gatsbyPresetResolved,
            {
              ...preset.options,
              stage: options.stage,
              // if preset options doesn't contains either `reactRuntime` or `reactImportSource`,
              // use global ones (set in gatsby-config)
              ...(!(
                preset.options?.reactRuntime ||
                preset.options?.reactImportSource
              )
                ? {
                    reactRuntime: options.reactRuntime,
                    reactImportSource: options.reactImportSource,
                  }
                : {}),
            },
          ],
          { type: `preset`, dirname: preset.dirname }
        )
        presetsToReturn.push(presetWithRequiredOptions)
      } else {
        // custom preset - let's materialize it and inspect
        const materializedPresetConfig = preset.value(babel, preset.options)

        const materializedPreset = {
          ...materializedPresetConfig,
          plugins: materializedPresetConfig.plugins
            ? materializedPresetConfig.plugins.map(nestedPlugin =>
                babel.createConfigItem(nestedPlugin, {
                  type: `plugin`,
                  dirname: path.dirname(preset.file.resolved),
                })
              )
            : undefined,
          presets: materializedPresetConfig.presets
            ? materializedPresetConfig.presets.map(nestedPreset =>
                babel.createConfigItem(nestedPreset, {
                  type: `preset`,
                  dirname: path.dirname(preset.file.resolved),
                })
              )
            : undefined,
        }

        convertCustomPresetsToPlugins(
          babel,
          materializedPreset,
          options,
          resolve,
          { presetsToReturn, pluginsToReturn }
        )
      }
    }
  }

  return {
    plugins: pluginsToReturn,
    presets: presetsToReturn,
  }
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
exports.convertCustomPresetsToPlugins = convertCustomPresetsToPlugins
