import type { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import type { PluginOptions } from "gatsby"
import type { IPathIgnoreOptions } from "gatsby-page-utils"

export interface IOptions extends PluginOptions {
  path: string
  pathCheck?: boolean
  ignore?: IPathIgnoreOptions | string | Array<string> | null
  slugify?: ISlugifyOptions
}
