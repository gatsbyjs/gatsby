import { ActionsUnion, IGatsbyState } from "../types"

export const pageDataReducer = (
  state: IGatsbyState["pageData"] = new Map(),
  action: ActionsUnion
): IGatsbyState["pageData"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `REMOVE_PAGE_DATA`:
      state.delete(action.payload.id)
      return state

    case `SET_PAGE_DATA`: {
      return state.set(action.payload.id, action.payload.resultHash)
    }

    default:
      return state
  }
}
