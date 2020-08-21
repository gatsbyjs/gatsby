import { ParentSpanPluginArgs } from "gatsby"

export function onPostBootstrap({ actions }: ParentSpanPluginArgs): void {
  // now that we are through the create pages flow that means we are finished bootstrapping collections
  actions.setPluginStatus({ isInBootstrap: false, nodes: [] })
}
