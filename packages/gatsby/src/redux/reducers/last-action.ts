import { IGatsbyState, ActionsUnion } from "../types"

export const lastAction = (
  _state: IGatsbyState["lastAction"],
  action: ActionsUnion
): IGatsbyState["lastAction"] => action
