import type { ProcessorOptions } from "@mdx-js/mdx"
import type { GatsbyCache, NodePluginArgs } from "gatsby"
import type { Pluggable } from "unified"
import type { IMdxPluginOptions } from "./plugin-options"

interface IGetSourcePluginsAsRemarkPlugins {
  gatsbyRemarkPlugins: IMdxPluginOptions["gatsbyRemarkPlugins"]
  getNode: NodePluginArgs["getNode"]
  getNodesByType: NodePluginArgs["getNodesByType"]
  pathPrefix: NodePluginArgs["pathPrefix"]
  reporter: NodePluginArgs["reporter"]
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
  const userPluginsFiltered = gatsbyRemarkPlugins
    ? gatsbyRemarkPlugins.filter(plugin => typeof plugin.module === `function`)
    : []

  if (!userPluginsFiltered.length) {
    return []
  }

  const userPlugins = userPluginsFiltered.map(plugin => {
    const requiredPlugin = plugin.module
    const wrappedGatsbyPlugin: Pluggable<any> = function wrappedGatsbyPlugin() {
      // eslint-disable-next-line @babel/no-invalid-this
      const mdxNode = getNode(this.data(`mdxNodeId`) as string)

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
          plugin.pluginOptions || {}
        )
      }
    }

    return wrappedGatsbyPlugin
  })

  return userPlugins
}
