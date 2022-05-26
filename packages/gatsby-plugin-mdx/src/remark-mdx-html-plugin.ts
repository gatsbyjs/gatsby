import type { Node } from "unist-util-visit"

// This plugin replaces html nodes with JSX divs that render given HTML via dangerouslySetInnerHTML
// We have to find out if this is really a good idea, but its processing footprint is very low
// compared to other solutions that would traverse the given HTML.
export const remarkMdxHtmlPlugin = () =>
  async function transformer(markdownAST: Node): Promise<Node> {
    const { visit } = await import(`unist-util-visit`)

    visit(markdownAST, node => {
      if (node.type !== `html`) {
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
