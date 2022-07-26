import { ActionsUnion, IGatsbyState } from "../types"

export const staticQueriesByTemplateReducer = (
  state: IGatsbyState["staticQueriesByTemplate"] = new Map(),
  action: ActionsUnion
): IGatsbyState["staticQueriesByTemplate"] => {
  switch (action.type) {
    case `REMOVE_STATIC_QUERIES_BY_TEMPLATE`:
      state.delete(action.payload.componentPath)
      return state

    case `SET_STATIC_QUERIES_BY_TEMPLATE`: {
      return state.set(
        action.payload.componentPath,
        action.payload.staticQueryHashes
      )
    }

    default:
      return state
  }
}
