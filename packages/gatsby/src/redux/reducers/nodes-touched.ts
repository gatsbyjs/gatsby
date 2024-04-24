import type { ActionsUnion, IGatsbyState } from "./../types";

export function nodesTouchedReducer(
  state: IGatsbyState["nodesTouched"] | undefined = new Set(),
  action: ActionsUnion,
): IGatsbyState["nodesTouched"] {
  switch (action.type) {
    case "CREATE_NODE":
      state.add(action.payload.id);
      return state;

    case "TOUCH_NODE":
      state.add(action.payload);
      return state;

    default:
      return state;
  }
}
