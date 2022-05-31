import type { ProcessorOptions } from "@mdx-js/mdx"
import type {
  PluginOptions,
  GatsbyCache,
  Reporter,
  NodePluginArgs,
} from "gatsby"
import deepmerge from "deepmerge"
import { IPluginRefObject } from "gatsby-plugin-utils/types"
import { getSourcePluginsAsRemarkPlugins } from "./get-source-plugins-as-remark-plugins"

export interface IMdxPluginOptions extends PluginOptions {
  extensions: [string]
  defaultLayouts: { [key: string]: string }
  mdxOptions: ProcessorOptions
  gatsbyRemarkPlugins: [IPluginRefObject]
}
interface IHelpers {
  getNode: NodePluginArgs["getNode"]
  getNodesByType: NodePluginArgs["getNodesByType"]
  pathPrefix: NodePluginArgs["pathPrefix"]
  reporter: Reporter
  cache: GatsbyCache
}
type MdxDefaultOptions = (pluginOptions: IMdxPluginOptions) => IMdxPluginOptions

export const defaultOptions: MdxDefaultOptions = pluginOptions => {
  const mdxOptions: ProcessorOptions = {
    format: `mdx`,
    useDynamicImport: true,
    providerImportSource: `@mdx-js/react`,
  }
  const options: IMdxPluginOptions = deepmerge(
    {
      extensions: [`.mdx`],
      defaultLayouts: {},
      mdxOptions,
    },
    pluginOptions
  )

  return options
}

type EnhanceMdxOptions = (
  pluginOptions: IMdxPluginOptions,
  helpers: IHelpers
) => Promise<ProcessorOptions>

export const enhanceMdxOptions: EnhanceMdxOptions = async (
  pluginOptions,
  helpers
) => {
  const options = defaultOptions(pluginOptions)

  // Support gatsby-remark-* plugins
  if (Object.keys(options.gatsbyRemarkPlugins).length) {
    if (!options.mdxOptions.remarkPlugins) {
      options.mdxOptions.remarkPlugins = []
    }

    // Parser plugins
    for (const plugin of options.gatsbyRemarkPlugins) {
      const requiredPlugin = plugin.module

      if (typeof requiredPlugin.setParserPlugins === `function`) {
        for (const parserPlugin of requiredPlugin.setParserPlugins(
          plugin.options || {}
        )) {
          if (Array.isArray(parserPlugin)) {
            const [parser, parserPluginOptions] = parserPlugin
            options.mdxOptions.remarkPlugins.push([parser, parserPluginOptions])
          } else {
            options.mdxOptions.remarkPlugins.push(parserPlugin)
          }
        }
      }
    }

    // Transformer plugins
    const gatsbyRemarkPlugins = await getSourcePluginsAsRemarkPlugins({
      gatsbyRemarkPlugins: options.gatsbyRemarkPlugins,
      ...helpers,
    })
    if (gatsbyRemarkPlugins) {
      options.mdxOptions.remarkPlugins.push(...gatsbyRemarkPlugins)
    }
  }

  return options.mdxOptions
}
