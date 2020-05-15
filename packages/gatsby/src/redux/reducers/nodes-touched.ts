import { ActionsUnion } from "./../types"
import { IGatsbyState } from "gatsby/src/redux/types"

export const nodesTouchedReducer = (
  state: IGatsbyState["nodesTouched"] = new Set(),
  action: ActionsUnion
): IGatsbyState["nodesTouched"] => {
  switch (action.type) {
    case `CREATE_NODE`:
      state.add(action.payload.id)
      return state

    case `TOUCH_NODE`:
      state.add(action.payload)
      return state

    default:
      return state
  }
}
