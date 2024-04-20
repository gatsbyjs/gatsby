import type { ActionsUnion, IGatsbyState } from "../types"

export function definitionsReducer(
  state: IGatsbyState["definitions"] | undefined = new Map(),
  action: ActionsUnion,
): IGatsbyState["definitions"] {
  switch (action.type) {
    case `SET_GRAPHQL_DEFINITIONS`:
      return action.payload
    default:
      return state
  }
}
