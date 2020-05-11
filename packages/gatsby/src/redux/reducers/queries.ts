import { ActionsUnion, IGatsbyState } from "../types"

export const queriesReducer = (
  state: Map<any> = new Map(),
  action:
    | ActionsUnion
    | { type: `SET_ALL_QUERIES`; payload: { queries: Map<any> } }
): IGatsbyState["webpack"] => {
  switch (action.type) {
    case `SET_ALL_QUERIES`: {
      return action.payload.queries
    }

    default:
      return state
  }
}
