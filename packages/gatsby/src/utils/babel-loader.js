const babelLoader = require(`babel-loader`)

const {
  prepareOptions,
  getCustomOptions,
  mergeConfigItemOptions,
  addRequiredPresetOptions,
} = require(`./babel-loader-helpers`)
const { getBrowsersList } = require(`./browserslist`)

/**
 * Gatsby's custom loader for webpack & babel
 *
 * Gatsby allows sites to either use our Babel setup (the default)
 * or to add a .babelrc to take control.
 *
 * Our default setup is defined in the fallbackPlugins/fallbackPresets arrays
 * below.
 *
 * After using either the fallback or user supplied setup, we add on a handful
 * of required plugins and finally merge in any presets/plugins supplied
 * by Gatsby plugins.
 *
 * You can find documentation for the custom loader here: https://babeljs.io/docs/en/next/babel-core.html#loadpartialconfig
 */

const customOptionsCache = new Map()
const configCache = new Map()
const babelrcFileToCacheKey = new Map()

module.exports = babelLoader.custom(babel => {
  return {
    // Passed the loader options.
    customOptions({
      stage = `test`,
      reactRuntime = `classic`,
      reactImportSource,
      rootDir = process.cwd(),
      ...options
    }) {
      if (customOptionsCache.has(stage)) {
        return customOptionsCache.get(stage)
      }

      const toReturn = {
        custom: {
          stage,
          reactRuntime,
          reactImportSource,
        },
        loader: {
          cacheIdentifier: JSON.stringify({
            browerslist: getBrowsersList(rootDir),
            babel: babel.version,
            gatsbyPreset: require(`babel-preset-gatsby/package.json`).version,
            env: babel.getEnv(),
          }),
          sourceType: `unambiguous`,
          ...getCustomOptions(stage),
          ...options,
        },
      }

      customOptionsCache.set(stage, toReturn)

      return toReturn
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig, { customOptions }) {
      let configCacheKey = customOptions.stage
      if (partialConfig.hasFilesystemConfig()) {
        // partialConfig.files is a Set that accumulates used config files (absolute paths)
        partialConfig.files.forEach(configFilePath => {
          configCacheKey += `_${configFilePath}`
        })

        // after generating configCacheKey add link between babelrc files and cache keys that rely on it
        // so we can invalidate memoized configs when used babelrc file changes
        partialConfig.files.forEach(configFilePath => {
          let cacheKeysToInvalidate = babelrcFileToCacheKey.get(configFilePath)
          if (!cacheKeysToInvalidate) {
            cacheKeysToInvalidate = new Set()
            babelrcFileToCacheKey.set(configFilePath, cacheKeysToInvalidate)
          }

          cacheKeysToInvalidate.add(configCacheKey)
        })
      }

      let { options } = partialConfig
      if (configCache.has(configCacheKey)) {
        return { ...options, ...configCache.get(configCacheKey) }
      }

      const [
        reduxPresets,
        reduxPlugins,
        requiredPresets,
        requiredPlugins,
        fallbackPresets,
      ] = prepareOptions(babel, customOptions)

      // If there is no filesystem babel config present, add our fallback
      // presets/plugins.
      if (!partialConfig.hasFilesystemConfig()) {
        options = {
          ...options,
          plugins: requiredPlugins,
          presets: [...fallbackPresets, ...requiredPresets],
        }
      } else {
        // With a babelrc present, only add our required plugins/presets
        options = {
          ...options,
          plugins: [...options.plugins, ...requiredPlugins],
          presets: [...options.presets, ...requiredPresets],
        }
        // User-defined preset likely contains `babel-preset-gatsby`
        // Make sure to pass required dynamic options (e.g. `stage` to it):
        addRequiredPresetOptions(babel, options.presets, customOptions)
      }

      // Merge in presets/plugins added from gatsby plugins.
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

      // cache just plugins and presets, because config also includes things like
      // filenames - this is mostly to not call `mergeConfigItemOptions` for each file
      // as that function call `babel.createConfigItem` and is quite expensive but also
      // skips quite a few nested loops on top of that
      configCache.set(configCacheKey, {
        plugins: options.plugins,
        presets: options.presets,
      })

      return options
    },
  }
})

module.exports.BabelConfigItemsCacheInvalidatorPlugin = class BabelConfigItemsCacheInvalidatorPlugin {
  constructor() {
    this.name = `BabelConfigItemsCacheInvalidatorPlugin`
  }

  apply(compiler) {
    compiler.hooks.invalid.tap(this.name, function (file) {
      const cacheKeysToInvalidate = babelrcFileToCacheKey.get(file)

      if (cacheKeysToInvalidate) {
        for (const cacheKey of cacheKeysToInvalidate) {
          configCache.delete(cacheKey)
        }
        babelrcFileToCacheKey.delete(file)
      }
    })
  }
}
