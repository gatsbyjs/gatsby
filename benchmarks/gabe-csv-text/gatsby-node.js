const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allGendataCsv (sort: { fields: [date], order: DESC }) {
          edges {
            node {
              id
              slug
              title
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allGendataCsv.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.slug,
      component: blogPost,
      context: {
        slug: post.node.slug,
        id: post.node.id,
        previous,
        next,
      },
    })
  })
}

// Use this to keep in sync with markdown benchmark. TODO: drop this and see the difference.
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `DataCsv`) {
    createNodeField({
      name: `slug2`,
      node,
      value: './' + node.slug,
    })
  }
}

