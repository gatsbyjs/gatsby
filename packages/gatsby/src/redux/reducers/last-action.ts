import { IGatsbyState, ActionsUnion } from "../types"

export const lastActionReducer = (
  _state: unknown,
  action: ActionsUnion
): IGatsbyState["lastAction"] => action
