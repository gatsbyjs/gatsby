const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve(`./src/templates/blog-post.js`)

  const result = await graphql(
    `
      {
        allMarkdownRemark(sort: null) {
          edges {
            node {
              id
              frontmatter {
                slug
                title
              }
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
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.frontmatter.slug,
      component: blogPost,
      context: {
        slug: post.node.frontmatter.slug,
        id: post.node.id,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNode } = actions

  if (node.internal.type === `GendataCsv`) {
    createNode({
      id: `${node.id}-MarkdownProxy`,
      parent: node.id,
      internal: {
        type: `MarkdownProxy`,
        mediaType: "text/markdown",
        content: node.articleContent,
        contentDigest: String(Math.random()),
      },
    })
  }
}
