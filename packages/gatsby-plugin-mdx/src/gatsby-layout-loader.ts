/* eslint-disable @babel/no-invalid-this */
import type { LoaderDefinition } from "webpack"
import type { Program, Identifier, ExportDefaultDeclaration } from "estree"
import type { NodeMap } from "./types"
import type { IMdxPluginOptions } from "./plugin-options"

import { getOptions } from "loader-utils"

export interface IGatsbyLayoutLoaderOptions {
  options: IMdxPluginOptions
  nodeMap: NodeMap
}

// Wrap MDX content with Gatsby Layout component
const gatsbyLayoutLoader: LoaderDefinition = async function (source) {
  const { nodeMap }: IGatsbyLayoutLoaderOptions = getOptions(this)

  const mdxPath = this.resourceQuery.split(`__mdxPath=`)[1]

  const res = nodeMap.get(mdxPath)

  if (!res) {
    throw new Error(
      `Unable to locate GraphQL File node for ${this.resourcePath}`
    )
  }

  const acorn = await import(`acorn`)
  const { default: jsx } = await import(`acorn-jsx`)
  const { generate } = await import(`astring`)
  const { buildJsx } = await import(`estree-util-build-jsx`)

  try {
    const tree = acorn.Parser.extend(jsx()).parse(source, {
      ecmaVersion: 2020,
      sourceType: `module`,
      locations: true,
    })

    const AST = tree as unknown as Program

    // Throw when tree is not a Program
    if (!AST.body && !AST.sourceType) {
      throw new Error(
        `Invalid AST. Parsed source code did not return a Program`
      )
    }

    // Inject import to actual MDX file at the top of the file
    AST.body.unshift({
      type: `ImportDeclaration`,
      specifiers: [
        {
          type: `ImportDefaultSpecifier`,
          local: {
            type: `Identifier`,
            name: `GATSBY_COMPILED_MDX`,
          },
        },
      ],
      source: {
        type: `Literal`,
        value: mdxPath,
      },
    })

    // Replace default export with wrapper function that injects compiled MDX as children
    AST.body = AST.body.map(child => {
      if (child.type !== `ExportDefaultDeclaration`) {
        return child
      }
      const declaration = child.declaration as unknown as Identifier
      if (!declaration.name) {
        throw new Error(`Unable to determine default export name`)
      }

      const pageComponentName = declaration.name

      return {
        type: `ExportDefaultDeclaration`,
        declaration: {
          type: `ArrowFunctionExpression`,
          id: null,
          expression: true,
          generator: false,
          async: false,
          params: [
            {
              type: `Identifier`,
              name: `props`,
            },
          ],
          body: {
            type: `JSXElement`,
            openingElement: {
              type: `JSXOpeningElement`,
              attributes: [
                {
                  type: `JSXSpreadAttribute`,
                  argument: {
                    type: `Identifier`,
                    name: `props`,
                  },
                },
              ],
              name: {
                type: `JSXIdentifier`,
                name: pageComponentName,
              },
              selfClosing: false,
            },
            closingElement: {
              type: `JSXClosingElement`,
              name: {
                type: `JSXIdentifier`,
                name: pageComponentName,
              },
            },
            children: [
              {
                type: `JSXExpressionContainer`,
                expression: {
                  type: `CallExpression`,
                  callee: {
                    type: `Identifier`,
                    name: `GATSBY_COMPILED_MDX`,
                  },
                  arguments: [],
                  optional: false,
                },
              },
            ],
          },
        },
      } as unknown as ExportDefaultDeclaration
    })

    // @todo what do we do with runtime, pragma and pragmaFrag options? We should still be able to support preact.
    buildJsx(AST)

    const transformedSource = generate(AST)

    return transformedSource
  } catch (e) {
    throw new Error(
      `Unable to inject MDX into JS template:\n${this.resourcePath}\n${e}`
    )
  }
}

export default gatsbyLayoutLoader
