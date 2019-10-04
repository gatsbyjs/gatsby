const _ = require(`lodash`)
const path = require(`path`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  return graphql(
    `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create blog posts pages.
    _.each(result.data.allMarkdownRemark.edges, edge => {
      createPage({
        path: edge.node.frontmatter.path,
        component: blogPost,
        context: {
          filePath: edge.node.frontmatter.path,
        },
      })
    })
  })
}
