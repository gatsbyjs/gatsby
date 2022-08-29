import { IGatsbyState, ActionsUnion, IGatsbySlice } from "../types"

export const slicesReducer = (
  state: IGatsbyState["slices"] = new Map<string, IGatsbySlice>(),
  action: ActionsUnion
): IGatsbyState["slices"] => {
  switch (action.type) {
    case `CREATE_SLICE`: {
      state.set(action.payload.name, action.payload)
      return state
    }

    case `DELETE_SLICE`: {
      state.delete(action.payload.name)
      return state
    }

    default:
      return state
  }
}
