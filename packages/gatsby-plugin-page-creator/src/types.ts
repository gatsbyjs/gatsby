import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { PluginOptions } from "gatsby"
import { IPathIgnoreOptions } from "gatsby-page-utils"

export interface IOptions extends PluginOptions {
  path: string
  pathCheck?: boolean
  ignore?: IPathIgnoreOptions | string | Array<string> | null
  slugify?: ISlugifyOptions
}
