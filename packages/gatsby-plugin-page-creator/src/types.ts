import { PluginOptions, Node } from "gatsby"

export interface IOptions extends PluginOptions {
  path: string
  pathCheck: boolean
  ignore: Array<string>
}

export interface IPluginState {
  isInBootstrap: boolean
  nodes: Array<{
    node: Node
    files: Array<string>
  }>
}
