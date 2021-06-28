import { ActionsUnion, IGatsbyNode } from "../../../redux/types"
import { Database } from "lmdb-store"

type NodeId = string

export function updateNodes(
  nodesDb: Database<IGatsbyNode, NodeId>,
  action: ActionsUnion
): Promise<boolean> | boolean {
  switch (action.type) {
    case `CREATE_NODE`:
    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`: {
      return nodesDb.put(action.payload.id, action.payload)
    }
    case `DELETE_NODE`: {
      if (action.payload) {
        return nodesDb.remove(action.payload.id)
      }
      return false
    }
  }
  return false
}
