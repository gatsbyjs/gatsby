import { ActionsUnion, IGatsbyState } from "../types"

export const definitionsReducer = (
  state: IGatsbyState["definitions"] = new Map(),
  action: ActionsUnion
): IGatsbyState["definitions"] => {
  switch (action.type) {
    case `SET_DEFINITIONS`:
      return action.payload
    default:
      return state
  }
}
