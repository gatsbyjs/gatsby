import { INodeDeleteEvent, ISourcingContext } from "../../types"

export function deleteNodes(
  context: ISourcingContext,
  deleteEvents: INodeDeleteEvent[]
) {
  for (const deleteEvent of deleteEvents) {
    const def = context.gatsbyNodeDefs.get(deleteEvent.remoteTypeName)
    if (!def) {
      throw new Error(`Unknown type ${deleteEvent.remoteTypeName}`)
    }
    const id = context.idTransform.remoteIdToGatsbyNodeId(
      deleteEvent.remoteId,
      def
    )
    const node = context.gatsbyApi.getNode(id)
    if (node) {
      context.gatsbyApi.actions.deleteNode({ node })
    }
    // TODO: find all nodes referencing deleted nodes and update/refetch all of them?
    //  Alternatively - soft-delete:
    //  keep a Set of deleted nodes somewhere in the memory  and filter them
    //  out from references in custom resolvers, e.g. context.deletedNodes.add(id)
  }
}
