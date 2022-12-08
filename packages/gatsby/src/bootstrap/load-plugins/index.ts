import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"
import * as nodeAPIs from "../../utils/api-node-docs"
import * as browserAPIs from "../../utils/api-browser-docs"
import ssrAPIs from "../../../cache-dir/api-ssr-docs"
import { loadInternalPlugins } from "./load-internal-plugins"
import {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
  validateConfigPluginsOptions,
} from "./validate"
import { IFlattenedPlugin } from "./types"
import { normalizeConfig } from "./utils/normalize"
import { getAPI } from "./utils/get-api"
import { flattenPlugins } from "./utils/flatten-plugins"
import { IGatsbyConfig } from "../../internal"

export async function loadPlugins(
  rawConfig: IGatsbyConfig,
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
  const pluginInfos = loadInternalPlugins(config, rootDir)

  // Create a flattened array of the plugins
  const pluginArray = flattenPlugins(pluginInfos)

  // Work out which plugins use which APIs, including those which are not
  // valid Gatsby APIs, aka 'badExports'
  let { flattenedPlugins, badExports } = await collatePluginAPIs({
    currentAPIs,
    flattenedPlugins: pluginArray,
    rootDir,
  })

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
