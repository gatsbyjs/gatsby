const path = require("path")
const { createFilePath } = require("gatsby-source-filesystem")

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              path
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
  }

  const posts = result.data.allMarkdownRemark.edges

  posts.forEach(({ node }) => {
    createPage({
      path: node.fields.path,
      component: path.resolve(`./src/templates/article.js`),
      context: { id: node.id },
    })
  })
}

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.type === `MarkdownRemark`
}

function onCreateNode({ node, actions, getNode }) {
  const { createNodeField } = actions

  const value = createFilePath({ node, getNode })
  createNodeField({
    name: `path`,
    node,
    value,
  })
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.onCreateNode = onCreateNode
