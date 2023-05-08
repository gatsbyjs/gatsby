import toHast from "mdast-util-to-hast"
import { cachedImport } from "./cache-helpers"

import type { Node } from "unist"
import type { Definition, Literal } from "mdast"
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx"

// This plugin replaces html nodes with JSX spans that render given HTML via dangerouslySetInnerHTML
// We have to find out if this is really a good idea, but its processing footprint is very low
// compared to other solutions that would traverse the given HTML.
export const remarkMdxHtmlPlugin = () =>
  async function transformer(markdownAST: Node): Promise<Node> {
    const { visit } = await cachedImport<typeof import("unist-util-visit")>(
      `unist-util-visit`
    )

    // Turn mdast nodes into hast nodes
    // Required to support gatsby-plugin-autolink-headers
    visit(markdownAST, node => {
      if (node.data && Object.keys(node.data).includes(`hChildren`)) {
        const converted = toHast(node as Definition, {
          allowDangerousHtml: true,
        })
        if (converted) {
          Object.assign(node, converted)
        }
      }
    })

    // Turn raw & html nodes into JSX spans with dangerouslySetInnerHTML
    // Required to support gatsby-remark-images & gatsby-remark-autolink-headers
    visit(markdownAST, node => {
      if (![`html`, `raw`].includes(node.type)) {
        return
      }

      const typedNode = node as MdxJsxFlowElement
      typedNode.type = `mdxJsxFlowElement`
      typedNode.name = `span`
      typedNode.attributes = [
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
                            value: (node as Literal).value,
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
        } as MdxJsxAttribute,
      ]
    })

    return markdownAST
  }
