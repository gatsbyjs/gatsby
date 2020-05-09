import { IGatsbyState, ActionsUnion } from "../types"

export const lastActionReducer = (
  _state: IGatsbyState["lastAction"],
  action: ActionsUnion
): IGatsbyState["lastAction"] => action
