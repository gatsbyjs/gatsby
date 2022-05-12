/* eslint-disable @babel/no-invalid-this */
import type { Node as AcornNode } from "acorn"
import type { Node } from "gatsby"
import type { LoaderDefinition } from "webpack"
import { parse } from "acorn"
import { generate, Node as AstringNode } from "astring"
import { getOptions } from "loader-utils"
import { defaultOptions, IMdxPluginOptions } from "./plugin-options"
import path from "path"

interface IFileNode extends Node {
  sourceInstanceName: string
}

export interface IMdxLoaderOptions {
  pluginOptions: IMdxPluginOptions
  fileMap: Map<string, IFileNode>
}

interface IMdxEstreeNode extends Node {
  body: [AcornNode]
}

// Wrap MDX content with Gatsby Layout component and inject components from `@mdx-js/react`
const gatsbyMdxLoader: LoaderDefinition = async function (source) {
  const { pluginOptions, fileMap }: IMdxLoaderOptions = getOptions(this)

  const options = defaultOptions(pluginOptions)

  const fileNode = fileMap.get(this.resourcePath)

  if (!fileNode) {
    throw new Error(
      `Unable to locate GraphQL File node for ${this.resourcePath}`
    )
  }

  // get the default layout for the file source group, or if it doesn't
  // exist, the overall default layout
  const layoutPath =
    options.defaultLayouts[fileNode.sourceInstanceName] ||
    options.defaultLayouts[`default`]

  // No default layout set? Nothing to do here!
  if (!layoutPath) {
    return source
  }

  // Parse to syntax tree
  const estree = parse(source, {
    sourceType: `module`,
    ecmaVersion: 2020,
  }) as unknown as IMdxEstreeNode

  // Import Gatsby layout
  estree.body.unshift(
    {
      type: `ImportDeclaration`,
      specifiers: [
        {
          type: `ImportDefaultSpecifier`,
          local: { type: `Identifier`, name: `GatsbyMDXWrapper` },
        },
      ],
      source: {
        type: `Literal`,
        value: path.join(`gatsby-plugin-mdx`, `dist`, `mdx-wrapper`),
      },
    } as unknown as AcornNode,
    {
      type: `ImportDeclaration`,
      specifiers: [
        {
          type: `ImportDefaultSpecifier`,
          local: { type: `Identifier`, name: `GatsbyMDXLayout` },
        },
      ],
      source: { type: `Literal`, value: layoutPath },
    } as unknown as AcornNode
  )

  // Replace default MDX export with a wrapper function that
  // wraps MDX with the Gatsby layout component
  // Inverted loop to speed it up, should be the last item
  for (let index = estree.body.length - 1; index >= 0; index--) {
    const node = estree.body[index]

    if (node.type === `ExportDefaultDeclaration`) {
      const defaultExportNode = node as any // @todo quick wins have to be done

      defaultExportNode.declaration = {
        type: `ArrowFunctionExpression`,
        id: null,
        expression: true,
        generator: false,
        async: false,
        params: [],
        body: {
          type: `CallExpression`,
          callee: {
            type: `Identifier`,
            name: `_jsx`,
          },
          arguments: [
            {
              type: `Identifier`,
              name: `GatsbyMDXWrapper`,
            },
            {
              type: `ObjectExpression`,
              properties: [
                {
                  type: `Property`,
                  method: false,
                  shorthand: true,
                  computed: false,
                  key: {
                    type: `Identifier`,
                    name: `MDXContent`,
                  },
                  kind: `init`,
                  value: {
                    type: `Identifier`,
                    name: `MDXContent`,
                  },
                },
                {
                  type: `Property`,
                  method: false,
                  shorthand: true,
                  computed: false,
                  key: {
                    type: `Identifier`,
                    name: `GatsbyMDXLayout`,
                  },
                  kind: `init`,
                  value: {
                    type: `Identifier`,
                    name: `GatsbyMDXLayout`,
                  },
                },
              ],
            },
          ],
          optional: false,
        },
      }

      break
    }
  }

  return generate(estree as unknown as AstringNode)
}

export default gatsbyMdxLoader
