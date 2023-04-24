import path from "path"
import readingTime from "reading-time"
import slugify from "@sindresorhus/slugify"
import { compileMDXWithCustomOptions } from "gatsby-plugin-mdx"
import remarkHeadingsPlugin from "./remark-headings-plugin.mjs"

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
export const onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    createNodeField({
      node,
      name: `timeToRead`,
      value: readingTime(node.body)
    })

    createNodeField({
      node,
      name: `slug`,
      value: `/${slugify(node.frontmatter.title)}`
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
export const createSchemaCustomization = async ({ getNode, getNodesByType, pathPrefix, reporter, cache, actions, schema, store }) => {
  const { createTypes } = actions

  const headingsResolver = schema.buildObjectType({
    name: `Mdx`,
    fields: {
      headings: {
        type: `[MdxHeading]`,
        async resolve(mdxNode) {
          const fileNode = getNode(mdxNode.parent)

          if (!fileNode) {
            return null
          }

          const result = await compileMDXWithCustomOptions(
            {
              source: mdxNode.body,
              absolutePath: fileNode.absolutePath,
            },
            {
              pluginOptions: {},
              customOptions: {
                mdxOptions: {
                  remarkPlugins: [remarkHeadingsPlugin],
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

          return result.metadata.headings
        }
      }
    }
  })

  createTypes([
    `#graphql
      type Mdx implements Node {
        timeToRead: Float @proxy(from: "fields.timeToRead.minutes")
        wordCount: Int @proxy(from: "fields.timeToRead.words")
      }
      type MdxHeading {
        value: String
        depth: Int
      }
    `,
    headingsResolver,
  ])
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
export const createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild("Error loading MDX result", result.errors)
  }

  const posts = result.data.allMdx.nodes

  posts.forEach(node => {
    // Don't create a page for src/pages/chart-info.mdx since this already gets created
    if (node.frontmatter.slug !== `/chart-info`) {
      if (node.frontmatter.slug === `/blog-1`) {
        // For /blog-1 create a page without defining a contentFilePath and just using the layout defined in src/components/layout.jsx
        createPage({
          path: node.frontmatter.slug,
          component: node.internal.contentFilePath,
          context: { id: node.id },
        })
      } else {
        // For /blog-2 define a contentFilePath and thus have two layouts. The src/components/layout.jsx and nested inside that the src/templates/posts.jsx
        createPage({
          path: node.frontmatter.slug,
          component: `${path.resolve(
            `./src/templates/posts.jsx`
          )}?__contentFilePath=${node.internal.contentFilePath}`,
          context: { id: node.id },
        })
      }
    }
  })
}
