import { IGatsbyState, ITouchNodeOptOutType } from "../types"

/**
 * Flags a source plugin as being "stateful" which means it manages its own data updates and Gatsby doesn't look for "stale" nodes after each `sourceNodes` run.
 */
export const statefulSourcePluginsReducer = (
  statefulSourcePlugins: IGatsbyState["statefulSourcePlugins"] = new Set(),
  action: ITouchNodeOptOutType
): IGatsbyState["statefulSourcePlugins"] => {
  switch (action.type) {
    case `DECLARE_STATEFUL_SOURCE_PLUGIN`: {
      statefulSourcePlugins.add(action.plugin.name)

      return statefulSourcePlugins
    }
    default:
      return statefulSourcePlugins
  }
}
