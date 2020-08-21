import { ParentSpanPluginArgs } from "gatsby"

export function onPreBootstrap({ actions }: ParentSpanPluginArgs): void {
  actions.setPluginStatus({
    isInBootstrap: true,
    nodes: [],
  })
}
