import type { IGatsbyState, ActionsUnion } from "../types"

export function lastActionReducer(
  _state: unknown,
  action: ActionsUnion,
): IGatsbyState["lastAction"] {
  return action
}
