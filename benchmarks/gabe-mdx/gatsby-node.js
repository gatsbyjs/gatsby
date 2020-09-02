const path = require("path")
const { createFilePath } = require("gatsby-source-filesystem")

exports.onCreateNode = (args) => {
  const { node, actions, getNode, ...rest } = args;
  const { createNodeField } = actions

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: "path",
      node,
      value,
    })
  }
}


exports.createPages = async ({ graphql, actions, reporter }) => {
  const progress = reporter.createProgress(`(userland gatsby-node) createPages`)
  console.time("(userland gatsby-node) total exports.createPages")
  progress.setStatus("initial graphl query")

  const { createPage } = actions

  console.time("(userland gatsby-node) initial graphql query")
  const result = await graphql(`
    query {
      allMdx {
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
  console.timeEnd("(userland gatsby-node) initial graphql query")

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
  }

  console.time("(userland gatsby-node) created pages")

  const posts = result.data.allMdx.edges

  progress.start()
  progress.total = posts.length
  progress.setStatus("Calling createPage for all pages")

  posts.forEach(({ node }) => {
    createPage({
      path: node.fields.path,
      component: path.resolve(`./src/templates/article.js`),
      context: { id: node.id },
    })
    progress.tick(1)
  })

  console.timeEnd("(userland gatsby-node) created pages")
  console.timeEnd("(userland gatsby-node) total exports.createPages")

  progress.done()
}
