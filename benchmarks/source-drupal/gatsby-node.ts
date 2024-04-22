// @ts-ignore
import type { GatsbyNode } from "gatsby"
// @ts-ignore
import kebabCase from "lodash.kebabcase"

export const onCreateNode: GatsbyNode["onCreateNode"] = function onCreateNode({
  actions,
  node,
}): void {
  const { createNodeField } = actions

  if (node.internal.type === "node__article") {
    createNodeField({ node, name: "slug", value: kebabCase(node.title) })
  }
}

export const createPages: GatsbyNode["createPages"] =
  async function createPages({ actions, graphql, reporter }): Promise<void> {
    const { createPage } = actions

    const result = await graphql(`
      {
        articles: allNodeArticle {
          nodes {
            fields {
              slug
            }
          }
        }
      }
    `)

    if (result.errors) {
      reporter.panicOnBuild(result.errors)
    }

    result.data.articles.nodes.map((article) => {
      createPage({
        path: article.fields.slug,
        component: require.resolve(`./src/templates/article.js`),
        context: {
          slug: article.fields.slug,
        },
      })
    })
  }
