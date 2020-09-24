const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allGendataJson(sort: { fields: [date], order: DESC }) {
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
  const posts = result.data.allGendataJson.edges

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
