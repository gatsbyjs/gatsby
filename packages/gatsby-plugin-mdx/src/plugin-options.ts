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
import rehypeMdxMetadataExtractor from "./rehype-metadata-extractor"
import { remarkMdxHtmlPlugin } from "./remark-mdx-html-plugin"

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
    jsxRuntime: `classic`,
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

  if (!options.mdxOptions.remarkPlugins) {
    options.mdxOptions.remarkPlugins = []
  }

  // Support gatsby-remark-* plugins
  if (Object.keys(options.gatsbyRemarkPlugins).length) {
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

  options.mdxOptions.remarkPlugins.push(remarkMdxHtmlPlugin)

  if (!options.mdxOptions.rehypePlugins) {
    options.mdxOptions.rehypePlugins = []
  }

  options.mdxOptions.rehypePlugins.push(
    // Extract metadata generated from by rehype-infer-* plugins
    // And use these to get the excerpt and time to read
    // @todo add options: https://github.com/rehypejs/rehype-infer-description-meta#options
    rehypeMdxMetadataExtractor
  )

  return options.mdxOptions
}
