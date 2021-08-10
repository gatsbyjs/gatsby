import {
  createPluginId,
  resolvePlugin,
} from "../../bootstrap/load-plugins/load"
import { normalizeConfig } from "../../bootstrap/load-plugins"
import type {
  IFlattenedPlugin,
  IRawSiteConfig,
} from "../../bootstrap/load-plugins/types"

export const mergeConfigOptions = ({
  flattenedPlugins,
  gatsbyConfig,
  rootDir,
}: {
  flattenedPlugins: Array<IFlattenedPlugin>
  gatsbyConfig: IRawSiteConfig
  rootDir: string
}): Array<IFlattenedPlugin> => {
  // The incoming gatsby-config.js might contain string + { resolve: '' } definitions for plugins
  // So needs to be normalized first
  const normalizedGatsbyConfig = normalizeConfig(gatsbyConfig)

  const generatedFlattenedPlugins = normalizedGatsbyConfig.plugins?.map(
    plugin => {
      // const info = resolvePlugin(plugin, rootDir)

      return {
        ...plugin,
        id: createPluginId(plugin.resolve, plugin),
        // pluginOptions: plugin.options,
      }
    }
  )

  console.log(generatedFlattenedPlugins)
  console.log(flattenedPlugins)
  console.log(rootDir)

  // Use resolvePlugin to generate the 'name' for each plugin
  // Necessary for createPluginId

  // Use createPluginId to generate the same id as in flattenedPlugins
  // id then is the unique identifier for merging both

  return generatedFlattenedPlugins
}
