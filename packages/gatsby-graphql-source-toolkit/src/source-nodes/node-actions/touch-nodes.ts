import { IGatsbyNodeDefinition, ISourcingContext } from "../../types"
import { Node } from "gatsby"

export function touchNodes(
  context: ISourcingContext,
  excludeIds: Set<string> = new Set()
): void {
  context.gatsbyNodeDefs.forEach(def =>
    touchNodesByType(context, def, excludeIds)
  )
}

export function touchNodesByType(
  context: ISourcingContext,
  def: IGatsbyNodeDefinition,
  excludeIds: Set<string> = new Set()
): void {
  const { gatsbyApi, typeNameTransform } = context
  const { actions, getNodesByType } = gatsbyApi

  const gatsbyTypeName = typeNameTransform.toGatsbyTypeName(def.remoteTypeName)
  const nodes: Node[] = getNodesByType(gatsbyTypeName)

  for (const node of nodes) {
    if (!excludeIds.has(node.id)) {
      actions.touchNode({ nodeId: node.id })
    }
  }
}
