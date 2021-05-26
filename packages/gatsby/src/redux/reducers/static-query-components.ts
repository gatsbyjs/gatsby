import { ActionsUnion, IGatsbyState } from "../types"

export const staticQueryComponentsReducer = (
  state: IGatsbyState["staticQueryComponents"] = new Map(),
  action: ActionsUnion
): IGatsbyState["staticQueryComponents"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `REPLACE_STATIC_QUERY`:
      return state.set(action.payload.id, action.payload)
    case `REMOVE_STATIC_QUERY`:
      state.delete(action.payload)
      return state
    case `SET_EXTRACTED_QUERIES`: {
      return action.payload.staticQueryComponents
    }
  }

  return state
}
