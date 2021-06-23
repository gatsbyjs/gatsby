import { createPageDependency } from "../redux/actions/add-page-dependency"
import { getNode } from "../datastore"
import { IGatsbyNode } from "../redux/types"
import { store } from "../redux"

/**
 * Determine if node has changed.
 */
export const hasNodeChanged = (id: string, digest: string): boolean => {
  const node = getNode(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/**
 * Get node and save path dependency.
 */
export const getNodeAndSavePathDependency = (
  id: string,
  path: string
): IGatsbyNode | undefined => {
  const node = getNode(id)

  if (!node) {
    console.error(
      `getNodeAndSavePathDependency failed for node id: ${id} as it was not found in cache`
    )
    return undefined
  }

  createPageDependency({ path, nodeId: id })
  return node
}

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
