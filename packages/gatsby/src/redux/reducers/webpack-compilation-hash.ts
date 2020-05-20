import { ActionsUnion, IGatsbyState } from "../types"

export const webpackCompilationHashReducer = (
  state: IGatsbyState["webpackCompilationHash"] = ``,
  action: ActionsUnion
): IGatsbyState["webpackCompilationHash"] => {
  switch (action.type) {
    case `SET_WEBPACK_COMPILATION_HASH`:
      return action.payload
    default:
      return state
  }
}
