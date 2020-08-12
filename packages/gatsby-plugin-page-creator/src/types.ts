import { PluginOptions } from "gatsby"

export interface IOptions extends PluginOptions {
  path: string
  pathCheck: boolean
  ignore: Array<string>
}
