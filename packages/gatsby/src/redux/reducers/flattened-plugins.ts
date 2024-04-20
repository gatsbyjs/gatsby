import type { IGatsbyState, ActionsUnion } from "../types"

export function flattenedPluginsReducer(
  state: IGatsbyState["flattenedPlugins"] | undefined = [],
  action: ActionsUnion,
): IGatsbyState["flattenedPlugins"] {
  switch (action.type) {
    case `SET_SITE_FLATTENED_PLUGINS`:
      return [...action.payload]

    default:
      return state
  }
}
