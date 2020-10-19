const path = require(`path`)

const blogPost = path.resolve(`./src/templates/blog-post.js`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMarkdownRemark {
        nodes {
          id
          frontmatter {
            slug
            title # used in prev/next
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const posts = result.data.allMarkdownRemark.nodes

  posts.forEach(({ id, frontmatter: { slug } }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1]
    const next = index === 0 ? null : posts[index - 1]

    createPage({
      path: slug,
      component: blogPost,
      context: {
        id,
        slug,
        previous,
        next,
      },
    })
  })
}

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.type === `GendataCsv`
}

// Not sure if there is a better way than to create a proxy node for markdown to pick up
// I certainly can't get remark to to pick up csv nodes :(
function onCreateNode({ node, actions }) {
  const { createNode } = actions

  createNode({
    id: `${node.id}-MarkdownProxy`,
    parent: node.id,
    internal: {
      type: `MarkdownProxy`,
      mediaType: "text/markdown",
      content: node.articleContent,
      contentDigest: node.articleContent,
    },
  })
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.onCreateNode = onCreateNode
