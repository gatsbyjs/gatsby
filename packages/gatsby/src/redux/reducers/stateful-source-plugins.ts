import { IGatsbyState, IEnableStatefulSourcePluginAction } from "../types"

/**
 * Flags a source plugin as being "stateful" which means it manages its own data updates and Gatsby doesn't look for "stale" nodes after each `sourceNodes` run.
 */
export const statefulSourcePluginsReducer = (
  statefulSourcePlugins: IGatsbyState["statefulSourcePlugins"] = new Set(),
  action: IEnableStatefulSourcePluginAction
): IGatsbyState["statefulSourcePlugins"] => {
  switch (action.type) {
    case `ENABLE_STATEFUL_SOURCE_PLUGIN`: {
      statefulSourcePlugins.add(action.plugin.name)

      return statefulSourcePlugins
    }
    default:
      return statefulSourcePlugins
  }
}
