import { IGatsbyNode } from "../internal"
import { store } from "../redux"

export function attachResolvedFields(node: IGatsbyNode): IGatsbyNode {
  if (!node.__gatsby_resolved) {
    const typeName = node.internal.type
    const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)
    const resolved = resolvedNodes?.get(node.id)
    if (resolved !== undefined) {
      node.__gatsby_resolved = resolved
    }
  }

  return node
}
