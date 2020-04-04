import { keys } from "lodash"

import { store } from "../../redux"
import nodeAPIs from "../../utils/api-node-docs"
import browserAPIs from "../../utils/api-browser-docs"
import ssrAPIs from "../../../cache-dir/api-ssr-docs"
import { loadPlugins, IPlugin } from "./load"
import {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
} from "./validate"

function getAPI(api: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
} {
  return keys(api).reduce((merged, key) => {
    merged[key] = keys(api[key])

    return merged
  }, {})
}

// Create a "flattened" array of plugins with all sub-plugins
// brought to the top-level. This simplifies running gatsby-* files
// for sub-plugins.
function flattenPlugins(plugins: IPlugin[]): IPlugin[] {
  const flattened: IPlugin[] = []

  function extractPlugins(plugin: IPlugin): void {
    plugin.options.plugins.forEach(function callbackFn(
      subPlugin: IPlugin
    ): void {
      flattened.push(subPlugin)
      extractPlugins(subPlugin)
    })
  }

  plugins.forEach(function callbackFn(plugin: IPlugin): void {
    flattened.push(plugin)
    extractPlugins(plugin)
  })

  return flattened
}

export default async function (
  config: {} = {},
  rootDir?: string
): Promise<IPlugin[]> {
  const currentAPIs = getAPI({
    browser: browserAPIs,
    node: nodeAPIs,
    ssr: ssrAPIs,
  })

  // Collate internal plugins, site config plugins, site default plugins
  const plugins = loadPlugins(config, rootDir)

  // Create a flattened array of the plugins
  let flattenedPlugins = flattenPlugins(plugins)

  // Work out which plugins use which APIs, including those which are not
  // valid Gatsby APIs, aka 'badExports'
  const x = collatePluginAPIs({ currentAPIs, flattenedPlugins })

  flattenedPlugins = x.flattenedPlugins
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
    payload: flattenedPlugins,
  })

  return flattenedPlugins
}
