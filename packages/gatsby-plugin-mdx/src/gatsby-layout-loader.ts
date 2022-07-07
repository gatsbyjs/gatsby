/* eslint-disable @babel/no-invalid-this */
import path from "path"
import { slash } from "gatsby-core-utils/path"
import { getPathToContentComponent } from "gatsby-core-utils/parse-component-path"
import type { Program, Identifier, ExportDefaultDeclaration } from "estree"
import type { LoaderDefinition } from "webpack"
import type { IMdxPluginOptions } from "./plugin-options"

export interface IGatsbyLayoutLoaderOptions {
  options: IMdxPluginOptions
  nodeExists: (path: string) => Promise<boolean>
}

// @ts-ignore - Correct return type
// Wrap MDX content with Gatsby Layout component
const gatsbyLayoutLoader: LoaderDefinition = async function (
  source
): Promise<string | Buffer | void> {
  const callback = this.async()
  const { nodeExists } = this.getOptions() as IGatsbyLayoutLoaderOptions
  // Figure out if the path to the MDX file is passed as a
  // resource query param or if the MDX file is directly loaded as path.
  const mdxPath = getPathToContentComponent(
    `${this.resourcePath}${this.resourceQuery}`
  )

  if (!(await nodeExists(mdxPath))) {
    return callback(
      new Error(`Unable to locate GraphQL File node for ${this.resourcePath}`)
    )
  }

  // add mdx dependency to webpack
  this.addDependency(path.resolve(mdxPath))

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

    /**
     * Inject import to actual MDX file at the top of the file
     * Input:
     * [none]
     * Output:
     * import GATSBY_COMPILED_MDX from "/absolute/path/to/content.mdx"
     */
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
        value: slash(mdxPath),
      },
    })

    /**
     * Replace default export with wrapper function that injects compiled MDX as children
     * Input:
     * export default PageTemplate
     * Output:
     * export default (props) => <PageTemplate {...props}>{GATSBY_COMPILED_MDX}</PageTemplate>
     **/
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
          type: `FunctionDeclaration`,
          id: {
            type: `Identifier`,
            name: `GatsbyMDXWrapper`,
          },
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
            type: `BlockStatement`,
            body: [
              {
                type: `ReturnStatement`,
                argument: {
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
                          name: `GATSBY_COMPILED_MDX`,
                        },
                        selfClosing: true,
                      },
                      children: [],
                    },
                  ],
                },
              },
            ],
          },
        },
      } as unknown as ExportDefaultDeclaration
    })

    buildJsx(AST)

    const transformedSource = generate(AST)

    // @ts-ignore - webpack typing is weird
    return callback(null, transformedSource, undefined, AST)
  } catch (e) {
    throw new Error(
      `Unable to inject MDX into JS template:\n${this.resourcePath}\n${e}`
    )
  }
}

export default gatsbyLayoutLoader
