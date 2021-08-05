import { IGatsbyState, ISetSiteFunctions } from "../types"

export const functionsReducer = (
  state: IGatsbyState["functions"] = [],
  action: ISetSiteFunctions
): IGatsbyState["functions"] => {
  switch (action.type) {
    case `SET_SITE_FUNCTIONS`:
      return action.payload

    default:
      return state
  }
}
