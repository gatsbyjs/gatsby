import babelLoader from "babel-loader"
import {
  prepareOptions,
  getCustomOptions,
  mergeConfigItemOptions,
} from "./babel-loader-helpers"
import { getBrowsersList } from "./browserslist"
import { version } from "babel-preset-gatsby/package.json"

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
export default babelLoader.custom((babel: Record<string, any>) => {
  const toReturn = {
    // Passed the loader options.
    customOptions({
      stage = `test`,
      reactRuntime = `classic`,
      rootDir = process.cwd(),
      ...options
    }: {
      stage?: string
      reactRuntime?: string
      rootDir?: string
    } = {}): { custom: Record<string, any>; loader: Record<string, any> } {
      return {
        custom: {
          stage,
          reactRuntime,
        },
        loader: {
          cacheIdentifier: JSON.stringify({
            browerslist: getBrowsersList(rootDir),
            babel: babel.version,
            gatsbyPreset: version,
            env: babel.getEnv(),
          }),
          sourceType: `unambiguous`,
          ...getCustomOptions(stage),
          ...options,
        },
      }
    },

    // Passed Babel's 'PartialConfig' object.
    config(
      partialConfig: Record<string, any>,
      { customOptions }: Record<string, any>
    ): Record<string, any> {
      let { options } = partialConfig
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
      }

      // Merge in presets/plugins added from gatsby plugins.
      reduxPresets.forEach((preset: Record<string, any>) => {
        options.presets = mergeConfigItemOptions({
          items: options.presets,
          itemToMerge: preset,
          type: `preset`,
          babel,
        })
      })

      reduxPlugins.forEach((plugin: Record<string, any>) => {
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
