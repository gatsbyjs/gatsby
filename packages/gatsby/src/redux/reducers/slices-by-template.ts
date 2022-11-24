import { ActionsUnion, IGatsbyState } from "../types"

export const slicesByTemplateReducer = (
  state: IGatsbyState["slicesByTemplate"] = new Map(),
  action: ActionsUnion
): IGatsbyState["slicesByTemplate"] => {
  switch (action.type) {
    case `SET_SLICES_BY_TEMPLATE`: {
      return state.set(action.payload.componentPath, action.payload.slices)
    }

    default:
      return state
  }
}
