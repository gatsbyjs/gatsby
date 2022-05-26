import type { ProcessorOptions } from "@mdx-js/mdx"
import type { GatsbyCache, Reporter, NodePluginArgs } from "gatsby"
import type { Pluggable } from "unified"

import { IMdxPluginOptions } from "./plugin-options"
import { remarkMdxHtmlPlugin } from "./remark-mdx-html-plugin"
import { pathPlugin } from "./remark-path-prefix-plugin"

interface IGetSourcePluginsAsRemarkPlugins {
  gatsbyRemarkPlugins: IMdxPluginOptions["gatsbyRemarkPlugins"]
  getNode: NodePluginArgs["getNode"]
  getNodesByType: NodePluginArgs["getNodesByType"]
  pathPrefix: NodePluginArgs["pathPrefix"]
  reporter: Reporter
  cache: GatsbyCache
}

export async function getSourcePluginsAsRemarkPlugins({
  gatsbyRemarkPlugins,
  getNode,
  getNodesByType,
  reporter,
  cache,
  pathPrefix,
}: IGetSourcePluginsAsRemarkPlugins): Promise<
  ProcessorOptions["remarkPlugins"]
> {
  const userPluginsFiltered = gatsbyRemarkPlugins.filter(
    plugin => typeof plugin.module === `function`
  )

  if (!userPluginsFiltered.length) {
    return pathPrefix ? [[pathPlugin, { pathPrefix }]] : []
  }

  const userPlugins = userPluginsFiltered.map(plugin => {
    const requiredPlugin = plugin.module
    const wrappedGatsbyPlugin: Pluggable<Array<any>> =
      function wrappedGatsbyPlugin() {
        // eslint-disable-next-line @babel/no-invalid-this
        const mdxNode = this.data(`mdxNode`)
        return async function transformer(markdownAST): Promise<any> {
          // Execute gatsby-remark-* plugin
          await requiredPlugin(
            {
              markdownAST,
              markdownNode: mdxNode,
              getNode,
              getNodesByType,
              get files() {
                return getNodesByType(`File`)
              },
              pathPrefix,
              reporter,
              cache,
            },
            plugin.options || {}
          )
        }
      }

    return wrappedGatsbyPlugin
  })

  if (pathPrefix) {
    return [[pathPlugin, { pathPrefix }], ...userPlugins, remarkMdxHtmlPlugin]
  } else {
    return [...userPlugins, remarkMdxHtmlPlugin]
  }
}
