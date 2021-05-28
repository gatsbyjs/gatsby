import { ActionsUnion, IGatsbyState } from "../types"
import { isLmdbStore } from "../../utils/is-lmdb-store"

export const actualNodesReducer = (
  state: IGatsbyState["nodes"] = new Map(),
  action: ActionsUnion
): IGatsbyState["nodes"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `CREATE_NODE`: {
      state.set(action.payload.id, action.payload)
      return state
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      state.set(action.payload.id, action.payload)
      return state

    case `DELETE_NODE`: {
      if (action.payload) {
        state.delete(action.payload.id)
      }
      return state
    }

    default:
      return state
  }
}

export const nodesReducer = (
  state: IGatsbyState["nodes"] = new Map(),
  action: ActionsUnion
): IGatsbyState["nodes"] => {
  // Nodes are stored in LMDB when strict mode is enabled
  if (isLmdbStore()) {
    return state
  }
  return actualNodesReducer(state, action)
}
