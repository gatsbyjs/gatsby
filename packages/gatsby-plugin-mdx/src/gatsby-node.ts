import type { GatsbyNode, NodeInput } from "gatsby"
import type { FileSystemNode } from "gatsby-source-filesystem"
import type { Options } from "rehype-infer-description-meta"
import path from "path"
import fs from "fs-extra"
import { getPathToContentComponent } from "gatsby-core-utils/parse-component-path"
import { defaultOptions, enhanceMdxOptions } from "./plugin-options"
import type { IGatsbyLayoutLoaderOptions } from "./gatsby-layout-loader"
import { parseFrontmatter } from "./frontmatter"
import { compileMDX, compileMDXWithCustomOptions } from "./compile-mdx"
import type { IGatsbyMDXLoaderOptions } from "./gatsby-mdx-loader"
import remarkInferTocMeta from "./remark-infer-toc-meta"
import { ERROR_MAP } from "./error-utils"
import { cachedImport, createFileToMdxCacheKey } from "./cache-helpers"

/**
 * Add support for MDX files including using Gatsby layout components
 */
export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] =
  async (
    {
      actions,
      loaders,
      getNode,
      getNodesByType,
      pathPrefix,
      reporter,
      cache,
      store,
    },
    pluginOptions
  ) => {
    const options = defaultOptions(pluginOptions)

    const mdxOptions = await enhanceMdxOptions(pluginOptions, {
      getNode,
      getNodesByType,
      pathPrefix,
      reporter,
      cache,
      store,
    })

    const mdxLoaderOptions: IGatsbyMDXLoaderOptions = {
      options: mdxOptions,
      reporter,
      cache,
      getNode,
    }

    const layoutLoaderOptions: IGatsbyLayoutLoaderOptions = {
      options,
      nodeExists: async function nodeExists(absolutePath): Promise<boolean> {
        const entry = await cache.get(createFileToMdxCacheKey(absolutePath))

        return !!entry
      },
      reporter,
    }

    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /\.mdx?$/,
            use: ({ resourceQuery, issuer }): Array<any> => [
              loaders.js({
                isPageTemplate: /async-requires/.test(issuer),
                resourceQuery,
              }),
              {
                loader: path.join(__dirname, `gatsby-mdx-loader`),
                options: mdxLoaderOptions,
              },
            ],
          },
          {
            test: /\.[tj]sx?$/,
            resourceQuery: /__contentFilePath=.+\.mdx?(&export=.*)?$/,
            use: ({ resourceQuery, issuer }): Array<any> => [
              loaders.js({
                isPageTemplate: /async-requires/.test(issuer),
                resourceQuery,
              }),
              {
                loader: path.join(__dirname, `gatsby-layout-loader`),
                options: layoutLoaderOptions,
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
) => defaultOptions(pluginOptions).extensions

/**
 * Convert MDX to JSX so that Gatsby can extract the GraphQL queries and render the pages.
 */
export const preprocessSource: GatsbyNode["preprocessSource"] = async (
  { filename, getNode, getNodesByType, pathPrefix, reporter, cache, store },
  pluginOptions
) => {
  const options = defaultOptions(pluginOptions)
  const { extensions } = options
  const mdxPath = getPathToContentComponent(filename)

  if (!mdxPath) {
    return undefined
  }

  const mdxOptions = await enhanceMdxOptions(pluginOptions, {
    getNode,
    getNodesByType,
    pathPrefix,
    reporter,
    cache,
    store,
  })

  const ext = path.extname(mdxPath)

  if (!extensions.includes(ext)) {
    return undefined
  }

  const contents = await fs.readFile(mdxPath)

  const compileRes = await compileMDX(
    {
      source: contents,
      absolutePath: filename,
    },
    mdxOptions,
    cache,
    reporter
  )

  if (!compileRes?.processedMDX) {
    return undefined
  }
  return compileRes.processedMDX.toString()
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  async (
    {
      getNode,
      getNodesByType,
      pathPrefix,
      reporter,
      cache,
      actions,
      schema,
      store,
    },
    pluginOptions
  ) => {
    const { createTypes } = actions
    const typeDefs = [
      schema.buildObjectType({
        name: `Mdx`,
        fields: {
          excerpt: {
            type: `String`,
            args: {
              pruneLength: {
                type: `Int`,
                defaultValue: 140,
              },
            },
            async resolve(mdxNode, { pruneLength }: { pruneLength: number }) {
              const rehypeInferDescriptionMeta = (
                await cachedImport<
                  typeof import("rehype-infer-description-meta")
                >(`rehype-infer-description-meta`)
              ).default

              const descriptionOptions: Options = { truncateSize: pruneLength }
              const fileNode = getNode(mdxNode.parent) as FileSystemNode

              if (!fileNode) {
                return null
              }

              const result = await compileMDXWithCustomOptions(
                {
                  source: mdxNode.body,
                  absolutePath: fileNode.absolutePath,
                },
                {
                  pluginOptions,
                  customOptions: {
                    mdxOptions: {
                      rehypePlugins: [
                        [rehypeInferDescriptionMeta, descriptionOptions],
                      ],
                    },
                  },
                  getNode,
                  getNodesByType,
                  pathPrefix,
                  reporter,
                  cache,
                  store,
                }
              )

              if (!result) {
                return null
              }

              return result.metadata.description
            },
          },
          tableOfContents: {
            type: `JSON`,
            args: {
              maxDepth: {
                type: `Int`,
                default: 6,
              },
            },
            async resolve(mdxNode, { maxDepth }) {
              const [{ visit }, { toc }] = await Promise.all([
                import(`unist-util-visit`),
                import(`mdast-util-toc`),
              ])

              const fileNode = getNode(mdxNode.parent) as FileSystemNode

              if (!fileNode) {
                return null
              }

              const result = await compileMDXWithCustomOptions(
                {
                  source: mdxNode.body,
                  absolutePath: fileNode.absolutePath,
                },
                {
                  pluginOptions,
                  customOptions: {
                    mdxOptions: {
                      remarkPlugins: [
                        [remarkInferTocMeta, { visit, toc, maxDepth }],
                      ],
                    },
                  },
                  getNode,
                  getNodesByType,
                  pathPrefix,
                  reporter,
                  cache,
                  store,
                }
              )

              if (!result) {
                return null
              }

              return result.metadata.toc
            },
          },
        },
        extensions: {
          infer: true,
        },
        interfaces: [`Node`],
      }),
    ]
    createTypes(typeDefs)
  }

// eslint-disable-next-line @typescript-eslint/naming-convention
export const shouldOnCreateNode: GatsbyNode["shouldOnCreateNode"] = (
  { node }: { node: FileSystemNode },
  pluginOptions
) => {
  const { extensions } = defaultOptions(pluginOptions)
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
  cache,
}) => {
  const rawBody = await loadNodeContent(node)

  const { frontmatter, body } = parseFrontmatter(
    node.internal.contentDigest,
    rawBody
  )
  const mdxNode: NodeInput = {
    id: createNodeId(`${node.id} >>> Mdx`),
    children: [],
    parent: node.id,
    internal: {
      type: `Mdx`,
      contentDigest: node.internal.contentDigest,
      contentFilePath: node.absolutePath,
    },
    body,
    frontmatter,
  }

  createNode(mdxNode)
  createParentChildLink({ parent: node, child: mdxNode })
  await cache.set(createFileToMdxCacheKey(node.absolutePath), mdxNode.id)
}

/**
 * Add frontmatter as page context for MDX pages
 */
export const onCreatePage: GatsbyNode["onCreatePage"] = async (
  { page, actions, getNodesByType },
  pluginOptions
) => {
  const { createPage, deletePage } = actions
  const { extensions } = defaultOptions(pluginOptions)

  const mdxPath = getPathToContentComponent(page.component)
  const ext = path.extname(mdxPath)

  // Only apply on pages based on .mdx files
  if (!extensions.includes(ext)) {
    return
  }

  const fileNode = getNodesByType(`File`).find(
    node => node.absolutePath === mdxPath
  )
  if (!fileNode) {
    throw new Error(`Could not locate File node for ${mdxPath}`)
  }

  // Avoid loops
  if (!page.context?.frontmatter) {
    const content = await fs.readFile(mdxPath, `utf8`)
    const { frontmatter } = parseFrontmatter(
      fileNode.internal.contentDigest,
      content
    )

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

export const onPluginInit: GatsbyNode["onPluginInit"] = ({ reporter }) => {
  // @ts-ignore - We only expose this type from gatsby-cli and we don't want to import from there
  reporter.setErrorMap(ERROR_MAP)
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
    gatsbyRemarkPlugins: Joi.subPlugins().description(
      `Use Gatsby-specific remark plugins`
    ),
    mdxOptions: Joi.object()
      .keys({
        jsx: Joi.boolean().description(`Whether to keep JSX`),
        format: Joi.string()
          .valid(`mdx`, `md`)
          .description(`Format of the files to be processed`),
        outputFormat: Joi.string()
          .valid(`program`, `function-body`)
          .description(
            `Whether to compile to a whole program or a function body`
          ),
        mdExtensions: Joi.array()
          .items(Joi.string().regex(/^\./))
          .description(`Extensions (with \`.\`) for markdown`),
        mdxExtensions: Joi.array()
          .items(Joi.string().regex(/^\./))
          .description(`Extensions (with \`.\`) for MDX`),
        recmaPlugins: Joi.array().description(
          `List of recma (esast, JavaScript) plugins`
        ),
        remarkPlugins: Joi.array().description(
          `List of remark (mdast, markdown) plugins`
        ),
        rehypePlugins: Joi.array().description(
          `List of rehype (hast, HTML) plugins`
        ),
        remarkRehypeOptions: Joi.object()
          .unknown()
          .description(`Options to pass through to \`remark-rehype\``),
      })
      .unknown(true)
      .default({})
      .description(
        `Pass any options to MDX. See: https://mdxjs.com/packages/mdx/#compilefile-options`
      ),
  })
