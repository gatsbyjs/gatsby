import { ActionsUnion, IGatsbyState } from "../types"

export const schemaReducer = (
  state: IGatsbyState["schema"] | {} = {},
  action: ActionsUnion
): IGatsbyState["schema"] | {} => {
  switch (action.type) {
    case `SET_SCHEMA`:
      return action.payload
    default:
      return state
  }
}
