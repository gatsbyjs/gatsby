import type { CompileOptions } from "@mdx-js/mdx"
import type { PluginOptions } from "gatsby"

export interface IMdxPluginOptions extends PluginOptions {
  extensions: [string]
  defaultLayouts: { [key: string]: string }
  mdxOptions: CompileOptions
}
type MdxDefaultOptions = (pluginOptions: IMdxPluginOptions) => IMdxPluginOptions

export const defaultOptions: MdxDefaultOptions = pluginOptions => {
  const options: IMdxPluginOptions = Object.assign(
    {
      extensions: [`.mdx`],
      defaultLayouts: {},
    },
    pluginOptions
  )

  return options
}
