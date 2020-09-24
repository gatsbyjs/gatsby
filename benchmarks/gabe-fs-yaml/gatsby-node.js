const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allGendataYaml(sort: { fields: [date], order: DESC }) {
          edges {
            node {
              id
              slug
              title # used in prev/next
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
  const posts = result.data.allGendataYaml.edges

  posts.forEach(({ node: {id, slug} }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

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

// exports.onCreateNode = ({ node, actions }) => {
//   const { createNode } = actions
//   console.log("t:", node.internal.type)
//   if (node.internal.type === "GendataYaml") console.log(node)
// }
