import { IGatsbyNode } from "../redux/types"
import { store } from "../redux"

/**
 * Get content for a node from the plugin that created it.
 */
export async function loadNodeContent(node: IGatsbyNode): Promise<string> {
  if (typeof node.internal.content === `string`) {
    return node.internal.content
  }

  // Load plugin's loader function
  const plugin = store
    .getState()
    .flattenedPlugins.find(plug => plug.name === node.internal.owner)

  if (!plugin) {
    throw new Error(
      `Could not find owner plugin of node for loadNodeContent with owner \`${node.internal.owner}\``
    )
  }

  const { loadNodeContent } = require(plugin.resolve)

  if (!loadNodeContent) {
    throw new Error(
      `Could not find function loadNodeContent for plugin ${plugin.name}`
    )
  }

  const content = await loadNodeContent(node)

  node.internal.content = content

  return content
}
