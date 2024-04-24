import type { ActionsUnion, IGatsbyState } from "../types";

export function webpackCompilationHashReducer(
  state: IGatsbyState["webpackCompilationHash"] | undefined = "",
  action: ActionsUnion,
): IGatsbyState["webpackCompilationHash"] {
  switch (action.type) {
    case "SET_WEBPACK_COMPILATION_HASH":
      return action.payload;
    default:
      return state;
  }
}
