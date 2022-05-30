import type { GatsbyNode, NodeInput } from "gatsby"
import type { FileSystemNode } from "gatsby-source-filesystem"
import type { Options } from "@mdx-js/loader"

import path from "path"
import { sentenceCase } from "change-case"
import fs from "fs-extra"
import grayMatter from "gray-matter"

import { defaultOptions, IMdxPluginOptions } from "./plugin-options"
import { IMdxLoaderOptions } from "./mdx-loader"

/**
 * Add support for MDX files including using Gatsby layout components
 */
export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = (
  { actions, loaders, getNodesByType },
  pluginOptions
) => {
  const fileNodes = getNodesByType(`File`)
  const fileMap = new Map()
  fileNodes.forEach(fileNode => fileMap.set(fileNode.absolutePath, fileNode))

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.mdx?$/,
          use: [
            loaders.js(),
            {
              loader: `@mdx-js/loader`,
              options: {
                useDynamicImport: true,
                providerImportSource: `@mdx-js/react`,
              } as Options,
            },
            {
              loader: path.join(`gatsby-plugin-mdx`, `dist`, `mdx-loader`),
              options: {
                fileMap,
                pluginOptions,
              } as IMdxLoaderOptions,
            },
          ],
        },
      ],
    },
  })
}

/**
 * Add the MDX extensions as resolvable. This is how the page creator
 * determines which files in the pages/ directory get built as pages.
 */
export const resolvableExtensions: GatsbyNode["resolvableExtensions"] = (
  _data,
  pluginOptions
) => defaultOptions(pluginOptions as IMdxPluginOptions).extensions

/**
 * Convert MDX to JSX so that Gatsby can extract the GraphQL queries and render the pages.
 */
export const preprocessSource: GatsbyNode["preprocessSource"] = async (
  { filename, contents },
  pluginOptions
) => {
  const { compile } = await import(`@mdx-js/mdx`)
  const { extensions, mdxOptions } = defaultOptions(
    pluginOptions as IMdxPluginOptions
  )

  const ext = path.extname(filename)

  if (!extensions.includes(ext)) {
    return undefined
  }

  const code = await compile(contents, mdxOptions)

  return code.toString()
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  async ({ actions, schema }, pluginOptions) => {
    const { compile } = await import(`@mdx-js/mdx`)
    const { mdxOptions } = defaultOptions(pluginOptions as IMdxPluginOptions)

    const { createTypes } = actions
    const typeDefs = [
      schema.buildObjectType({
        name: `MdxFrontmatter`,
        fields: {
          title: `String`,
        },
      }),
      schema.buildObjectType({
        name: `Mdx`,
        fields: {
          rawBody: `String!`,
          frontmatter: `MdxFrontmatter!`,
          slug: `String`,
          title: `String`,
        },
        interfaces: [`Node`],
      }),
    ]
    createTypes(typeDefs)
  }

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_shouldOnCreateNode: GatsbyNode["unstable_shouldOnCreateNode"] =
  ({ node }: { node: FileSystemNode }, pluginOptions) => {
    const { extensions } = defaultOptions(pluginOptions as IMdxPluginOptions)
    return node.internal.type === `File` && extensions.includes(node.ext)
  }

/**
 * Create Mdx nodes from MDX files.
 */
export const onCreateNode: GatsbyNode<FileSystemNode>["onCreateNode"] = async ({
  node,
  loadNodeContent,
  actions: { createNode, createParentChildLink },
  createNodeId,
}) => {
  const content = await loadNodeContent(node)

  const { data: frontmatter } = grayMatter(content)

  // Use slug from frontmatter, otherwise fall back to the file name and path
  const slug =
    frontmatter.slug ||
    [node.relativeDirectory, node.name === `index` ? `` : node.name]
      .filter(Boolean)
      .join(`/`)

  // Use title from frontmatter, otherwise fall back to the file name
  const title =
    frontmatter.title || node.name === `index`
      ? `Home`
      : sentenceCase(node.name)

  const mdxNode: NodeInput = {
    id: createNodeId(`${node.id} >>> Mdx`),
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: `Mdx`,
      contentDigest: node.internal.contentDigest,
    },
    rawBody: content,
    slug,
    title,
    frontmatter,
  }

  createNode(mdxNode)
  createParentChildLink({ parent: node, child: mdxNode })
}

/**
 * Add frontmatter as page context for MDX pages
 */
export const onCreatePage: GatsbyNode["onCreatePage"] = async (
  { page, actions },
  pluginOptions
) => {
  const { createPage, deletePage } = actions
  const { extensions } = defaultOptions(pluginOptions as IMdxPluginOptions)
  const ext = path.extname(page.component)

  // Only apply on pages based on .mdx files and avoid loops
  if (extensions.includes(ext) && !page.context.frontmatter) {
    const content = await fs.readFile(page.component, `utf8`)
    const { data: frontmatter } = grayMatter(content)

    deletePage(page)
    createPage({
      ...page,
      context: {
        ...page.context,
        frontmatter,
      },
    })
  }
}

/**
 * Plugin option validation
 */
export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({
  Joi,
}) =>
  Joi.object({
    extensions: Joi.array()
      .items(Joi.string())
      .default([`.mdx`])
      .description(
        `Configure the file extensions that gatsby-plugin-mdx will process`
      ),
  })
