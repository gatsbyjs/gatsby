import { IGatsbyState, ActionsUnion } from "../types"

export const buildStatesReducer = (
  state: IGatsbyState["currentBuildState"] = {},
  action: ActionsUnion
): IGatsbyState["currentBuildState"] => {
  switch (action.type) {
    case `SET_BUILD_STATE`:
      return action.payload

    default:
      return state
  }
}
