import type { ProcessorOptions } from "@mdx-js/mdx"
import type { GatsbyCache, Reporter, NodePluginArgs } from "gatsby"
import type { Pluggable } from "unified"

import { IMdxPluginOptions } from "./plugin-options"

interface IGetSourcePluginsAsRemarkPlugins {
  gatsbyRemarkPlugins: IMdxPluginOptions["gatsbyRemarkPlugins"]
  getNode: NodePluginArgs["getNode"]
  getNodesByType: NodePluginArgs["getNodesByType"]
  pathPrefix: NodePluginArgs["pathPrefix"]
  reporter: Reporter
  cache: GatsbyCache
}

// ensure only one `/` in new url
const withPathPrefix = (url: string, pathPrefix: string): string =>
  (pathPrefix + url).replace(/\/\//, `/`)

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
  const { visit } = await import(`unist-util-visit`)
  const { map } = await import(`unist-util-map`)

  // Ensure relative links include `pathPrefix`
  const pathPlugin = () =>
    async function transformer(markdownAST): Promise<any> {
      if (!pathPrefix) {
        return markdownAST
      }
      visit(markdownAST, [`link`, `definition`], node => {
        if (
          node.url &&
          typeof node.url === `string` &&
          node.url.startsWith(`/`) &&
          !node.url.startsWith(`//`)
        ) {
          // TODO: where does withPathPrefix
          node.url = withPathPrefix(node.url, pathPrefix)
        }
      })
      return markdownAST
    }

  const userPluginsFiltered = gatsbyRemarkPlugins.filter(
    plugin => typeof plugin.module === `function`
  )

  if (!userPluginsFiltered.length) {
    return pathPrefix ? [pathPlugin] : []
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

          const divAST = map(markdownAST, node => {
            if (node.type !== `html`) {
              return node
            }
            return {
              type: `mdxJsxFlowElement`,
              name: `div`,
              attributes: [
                {
                  type: `mdxJsxAttribute`,
                  name: `dangerouslySetInnerHTML`,
                  value: {
                    type: `mdxJsxAttributeValueExpression`,
                    data: {
                      estree: {
                        type: `Program`,
                        body: [
                          {
                            type: `ExpressionStatement`,
                            expression: {
                              type: `ObjectExpression`,
                              properties: [
                                {
                                  type: `Property`,
                                  method: false,
                                  shorthand: false,
                                  computed: false,
                                  key: {
                                    type: `Identifier`,
                                    name: `__html`,
                                  },
                                  value: {
                                    type: `Literal`,
                                    value: node.value,
                                  },
                                  kind: `init`,
                                },
                              ],
                            },
                          },
                        ],
                        sourceType: `module`,
                      },
                    },
                  },
                },
              ],
            }
          })

          return divAST
        }
      }

    return wrappedGatsbyPlugin
  })

  if (pathPrefix) {
    return [pathPlugin, ...userPlugins]
  } else {
    return userPlugins
  }
}
