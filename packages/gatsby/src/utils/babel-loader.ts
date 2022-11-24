import babelLoader from "babel-loader"
import type { Compiler } from "webpack"
import Babel, { ConfigItem } from "@babel/core"
import {
  prepareOptions,
  getCustomOptions,
  mergeConfigItemOptions,
  addRequiredPresetOptions,
  ICustomOptions,
} from "./babel-loader-helpers"
import type { Stage } from "../commands/types"
import { getBrowsersList } from "./browserslist"

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

interface IBabelCustomLoader {
  custom: ICustomOptions
  loader: Record<string, unknown>
}

const customOptionsCache = new Map()
const configCache = new Map()
const babelrcFileToCacheKey = new Map()

const customBabelLoader = babelLoader.custom(babel => {
  return {
    // Passed the loader options.
    customOptions({
      stage = `test` as Stage,
      reactRuntime = `classic`,
      reactImportSource,
      isPageTemplate,
      resourceQuery,
      rootDir = process.cwd(),
      ...options
    }): IBabelCustomLoader {
      const customOptionsCacheKey = `${stage}-${isPageTemplate}-${resourceQuery}`

      if (customOptionsCache.has(customOptionsCacheKey)) {
        return customOptionsCache.get(customOptionsCacheKey)
      }

      const toReturn = {
        custom: {
          stage,
          reactRuntime,
          reactImportSource,
          isPageTemplate,
          resourceQuery,
        },
        loader: {
          cacheIdentifier: JSON.stringify({
            browsersList: getBrowsersList(rootDir),
            babel: babel.version,
            gatsbyPreset: require(`babel-preset-gatsby/package.json`).version,
            env: babel.getEnv(),
          }),
          sourceType: `unambiguous`,
          ...getCustomOptions(stage as Stage),
          ...options,
        },
      }

      customOptionsCache.set(customOptionsCacheKey, toReturn)

      return toReturn
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig, { customOptions }): Babel.TransformOptions {
      const { stage, isPageTemplate, resourceQuery } = customOptions
      let configCacheKey = `${stage}-${isPageTemplate}-${resourceQuery}`

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
          itemToMerge: preset as ConfigItem,
          type: `preset`,
          babel,
        })
      })

      reduxPlugins.forEach(plugin => {
        options.plugins = mergeConfigItemOptions({
          items: options.plugins,
          itemToMerge: plugin as ConfigItem,
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

export default customBabelLoader

export class BabelConfigItemsCacheInvalidatorPlugin {
  name: string

  constructor() {
    this.name = `BabelConfigItemsCacheInvalidatorPlugin`
  }

  apply(compiler: Compiler): void {
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
