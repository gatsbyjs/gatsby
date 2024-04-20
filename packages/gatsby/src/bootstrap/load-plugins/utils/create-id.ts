import { createNodeId } from "../../../utils/create-node-id"
import type { IPluginRefObject } from "../types"

/**
 * Make sure key is unique to plugin options. E.g. there could
 * be multiple source-filesystem plugins, with different names
 * (docs, blogs).
 *
 * @param name Name of the plugin
 * @param pluginObject Object of the plugin
 */
export function createPluginId(
  name: string,
  pluginObject: IPluginRefObject | null = null,
): string {
  return createNodeId(
    name + (pluginObject ? JSON.stringify(pluginObject.options) : ``),
    `Plugin`,
  )
}
