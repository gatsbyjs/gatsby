import { createPageDependency } from "../redux/actions/add-page-dependency"
import { getNode, getNodesByType } from "../datastore"
import { IGatsbyNode } from "../redux/types"

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
