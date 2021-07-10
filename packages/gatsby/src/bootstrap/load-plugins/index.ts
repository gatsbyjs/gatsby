import _ from "lodash"

import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"
import * as nodeAPIs from "../../utils/api-node-docs"
import * as browserAPIs from "../../utils/api-browser-docs"
import ssrAPIs from "../../../cache-dir/api-ssr-docs"
import { loadPlugins as loadPluginsInternal } from "./load"
import {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
  ExportType,
  ICurrentAPIs,
  validateConfigPluginsOptions,
} from "./validate"
import {
  IPluginInfo,
  IFlattenedPlugin,
  ISiteConfig,
  IRawSiteConfig,
} from "./types"
import { IPluginRefObject, PluginRef } from "gatsby-plugin-utils/dist/types"

const getAPI = (
  api: { [exportType in ExportType]: { [api: string]: boolean } }
): ICurrentAPIs =>
  _.keys(api).reduce<Partial<ICurrentAPIs>>((merged, key) => {
    merged[key] = _.keys(api[key])
    return merged
  }, {}) as ICurrentAPIs

// Create a "flattened" array of plugins with all subplugins
// brought to the top-level. This simplifies running gatsby-* files
// for subplugins.
const flattenPlugins = (plugins: Array<IPluginInfo>): Array<IPluginInfo> => {
  const flattened: Array<IPluginInfo> = []
  const extractPlugins = (plugin: IPluginInfo): void => {
    if (plugin.pluginOptions && plugin.pluginOptions.plugins) {
      plugin.pluginOptions.plugins.forEach(subPlugin => {
        flattened.push(subPlugin)
        extractPlugins(subPlugin)
      })
    }
  }

  plugins.forEach(plugin => {
    flattened.push(plugin)
    extractPlugins(plugin)
  })

  return flattened
}

function normalizePlugin(plugin): IPluginRefObject {
  if (typeof plugin === `string`) {
    return {
      resolve: plugin,
      options: {},
    }
  }

  if (plugin.options?.plugins) {
    plugin.options = {
      ...plugin.options,
      plugins: normalizePlugins(plugin.options.plugins),
    }
  }

  return plugin
}

function normalizePlugins(plugins?: Array<PluginRef>): Array<IPluginRefObject> {
  return (plugins || []).map(normalizePlugin)
}

const normalizeConfig = (config: IRawSiteConfig = {}): ISiteConfig => {
  return {
    ...config,
    plugins: (config.plugins || []).map(normalizePlugin),
  }
}

export async function loadPlugins(
  rawConfig: IRawSiteConfig = {},
  rootDir: string
): Promise<Array<IFlattenedPlugin>> {
  // Turn all strings in plugins: [`...`] into the { resolve: ``, options: {} } form
  const config = normalizeConfig(rawConfig)

  // Show errors for invalid plugin configuration
  await validateConfigPluginsOptions(config, rootDir)

  const currentAPIs = getAPI({
    browser: browserAPIs,
    node: nodeAPIs,
    ssr: ssrAPIs,
  })

  // Collate internal plugins, site config plugins, site default plugins
  const pluginInfos = loadPluginsInternal(config, rootDir)

  // Create a flattened array of the plugins
  const pluginArray = flattenPlugins(pluginInfos)

  // Work out which plugins use which APIs, including those which are not
  // valid Gatsby APIs, aka 'badExports'
  const x = collatePluginAPIs({ currentAPIs, flattenedPlugins: pluginArray })

  // From this point on, these are fully-resolved plugins.
  let flattenedPlugins = x.flattenedPlugins
  const badExports = x.badExports

  // Show errors for any non-Gatsby APIs exported from plugins
  await handleBadExports({ currentAPIs, badExports })

  // Show errors when ReplaceRenderer has been implemented multiple times
  flattenedPlugins = handleMultipleReplaceRenderers({
    flattenedPlugins,
  })

  // If we get this far, everything looks good. Update the store
  store.dispatch({
    type: `SET_SITE_FLATTENED_PLUGINS`,
    payload: flattenedPlugins as IGatsbyState["flattenedPlugins"],
  })

  return flattenedPlugins
}
