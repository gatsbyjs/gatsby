import { IGatsbyState, ISetResolvedThemesAction } from "../types"

export const themesReducer = (
  state: IGatsbyState["themes"] = {},
  action: ISetResolvedThemesAction
): IGatsbyState["themes"] => {
  switch (action.type) {
    case `SET_RESOLVED_THEMES`:
      return {
        ...state,
        themes: action.payload,
      }

    default:
      return state
  }
}
