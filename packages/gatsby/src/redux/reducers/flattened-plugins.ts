import { IGatsbyState, ActionsUnion } from "../types"

export const flattenedPluginsReducer = (
  state: IGatsbyState["flattenedPlugins"] = [],
  action: ActionsUnion
): IGatsbyState["flattenedPlugins"] => {
  switch (action.type) {
    case `SET_SITE_FLATTENED_PLUGINS`:
      return [...action.payload]

    default:
      return state
  }
}
