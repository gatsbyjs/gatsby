import type { IGatsbyState, ISetSiteFunctions } from "../types"

export function functionsReducer(
  state: IGatsbyState["functions"] | undefined = [],
  action: ISetSiteFunctions,
): IGatsbyState["functions"] {
  switch (action.type) {
    case `SET_SITE_FUNCTIONS`:
      return action.payload

    default:
      return state
  }
}
