import { IGatsbyState, ActionsUnion } from "../types"

export const resolvedNodesCacheReducer = (
  state: IGatsbyState["resolvedNodesCache"] = new Map(),
  action: ActionsUnion
): IGatsbyState["resolvedNodesCache"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
    case `CREATE_NODE`:
    case `DELETE_NODE`:
      return new Map()

    case `SET_RESOLVED_NODES`: {
      const { key, nodes } = action.payload
      state.set(key, nodes)
      return state
    }

    default:
      return state
  }
}
