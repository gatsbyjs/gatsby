import type { Node } from "unist-util-visit"
import type { Definition } from "mdast"
import toHast from "mdast-util-to-hast"

import { cachedImport } from "./cache-helpers"

// This plugin replaces html nodes with JSX divs that render given HTML via dangerouslySetInnerHTML
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

    // Turn raw & html nodes into JSX divs with dangerouslySetInnerHTML
    // Required to support gatsby-remark-images & gatsby-remark-autolink-headers
    visit(markdownAST, node => {
      if (![`html`, `raw`].includes(node.type)) {
        return
      }

      node.type = `mdxJsxFlowElement`
      node.name = `div`
      node.attributes = [
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
      ]
    })

    return markdownAST
  }
