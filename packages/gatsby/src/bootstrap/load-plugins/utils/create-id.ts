import { createNodeId } from "../../../utils/create-node-id"
import { IPluginRefObject } from "../types"

/**
 * Make sure key is unique to plugin options. E.g. there could
 * be multiple source-filesystem plugins, with different names
 * (docs, blogs).
 *
 * @param name Name of the plugin
 * @param pluginObject Object of the plugin
 */
export const createPluginId = (
  name: string,
  pluginObject: IPluginRefObject | null = null
): string =>
  createNodeId(
    name + (pluginObject ? JSON.stringify(pluginObject.options) : ``),
    `Plugin`
  )
