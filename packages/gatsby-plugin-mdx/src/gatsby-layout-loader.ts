/* eslint-disable @babel/no-invalid-this */
import path from "path"
import type { NodePluginArgs } from "gatsby"
import { slash } from "gatsby-core-utils/path"
import { getPathToContentComponent } from "gatsby-core-utils/parse-component-path"
import type {
  Program,
  Declaration,
  Expression,
  ExportDefaultDeclaration,
  Identifier,
  FunctionDeclaration,
} from "estree"
import type { LoaderDefinition } from "webpack"
import type { IMdxPluginOptions } from "./plugin-options"
import { ERROR_CODES } from "./error-utils"
import { cachedImport } from "./cache-helpers"

export interface IGatsbyLayoutLoaderOptions {
  options: IMdxPluginOptions
  nodeExists: (path: string) => Promise<boolean>
  reporter: NodePluginArgs["reporter"]
}

// Wrap MDX content with Gatsby Layout component
const gatsbyLayoutLoader: LoaderDefinition = async function (
  source
): Promise<string | Buffer> {
  const { nodeExists, reporter } =
    this.getOptions() as IGatsbyLayoutLoaderOptions
  // Figure out if the path to the MDX file is passed as a
  // resource query param or if the MDX file is directly loaded as path.
  const mdxPath = getPathToContentComponent(
    `${this.resourcePath}${this.resourceQuery}`
  )

  if (!(await nodeExists(mdxPath))) {
    reporter.panicOnBuild({
      id: ERROR_CODES.NonExistentFileNode,
      context: {
        resourcePath: this.resourcePath,
        mdxPath,
      },
    })
  }

  // add mdx dependency to webpack
  this.addDependency(path.resolve(mdxPath))

  const acorn = await cachedImport<typeof import("acorn")>(`acorn`)
  // @ts-ignore - We typecast below
  const { default: jsx } = await cachedImport(`acorn-jsx`)
  const { generate } = await cachedImport<typeof import("astring")>(`astring`)
  const { buildJsx } = await cachedImport<
    typeof import("estree-util-build-jsx")
  >(`estree-util-build-jsx`)

  const JSX = jsx as typeof import("acorn-jsx")

  try {
    const tree = acorn.Parser.extend(JSX()).parse(source, {
      ecmaVersion: `latest`,
      sourceType: `module`,
      locations: true,
    })

    const AST = tree as unknown as Program

    // Throw when tree is not a Program
    if (!AST.body && !AST.sourceType) {
      reporter.panicOnBuild({
        id: ERROR_CODES.InvalidAcornAST,
        context: {
          resourcePath: this.resourcePath,
          mdxPath,
        },
      })
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

    let hasClassicReactImport = false

    /**
     * Replace default export with wrapper function that injects compiled MDX as children
     * Input:
     * export default PageTemplate
     * Output:
     * export default (props) => <PageTemplate {...props}>{GATSBY_COMPILED_MDX}</PageTemplate>
     **/
    const newBody: Array<any> = []
    AST.body.forEach(child => {
      if (
        child.type === `ImportDeclaration` &&
        child.source.value === `react`
      ) {
        hasClassicReactImport = true
      }

      if (child.type !== `ExportDefaultDeclaration`) {
        newBody.push(child)
        return
      }

      const declaration = child.declaration as Declaration | Expression
      const pageComponentName =
        (declaration as FunctionDeclaration).id?.name ||
        (declaration as Identifier).name ||
        null

      if (!pageComponentName) {
        reporter.panicOnBuild({
          id: ERROR_CODES.NonDeterminableExportName,
          context: {
            resourcePath: this.resourcePath,
          },
        })
      }

      newBody.push(declaration)

      newBody.push({
        type: `ExportDefaultDeclaration`,
        declaration: {
          type: `FunctionDeclaration`,
          id: {
            type: `Identifier`,
            name: `GatsbyMDXWrapper`,
          },
          expression: false,
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
      } as unknown as ExportDefaultDeclaration)
    })

    if (!hasClassicReactImport) {
      newBody.unshift({
        type: `ImportDeclaration`,
        specifiers: [
          {
            type: `ImportDefaultSpecifier`,
            local: {
              type: `Identifier`,
              name: `React`,
            },
          },
        ],
        source: {
          type: `Literal`,
          value: `react`,
        },
      })
    }

    AST.body = newBody

    buildJsx(AST)

    const transformedSource = generate(AST)

    return transformedSource
  } catch (error) {
    reporter.panicOnBuild({
      id: ERROR_CODES.InvalidAcornAST,
      context: {
        resourcePath: this.resourcePath,
        mdxPath,
      },
      error,
    })
    return ``
  }
}

export default gatsbyLayoutLoader
