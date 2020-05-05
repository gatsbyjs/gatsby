import { IGatsbyState, ActionsUnion } from "../types"

export const lastAction = (
  state: IGatsbyState["lastAction"] = null,
  action: ActionsUnion
): IGatsbyState["lastAction"] => action
