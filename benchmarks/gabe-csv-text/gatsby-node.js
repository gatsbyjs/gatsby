const path = require(`path`)

const blogPost = path.resolve(`./src/templates/blog-post.js`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allGendataCsv {
        nodes {
          id
          slug
          title # used in prev/next
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const posts = result.data.allGendataCsv.nodes

  posts.forEach(({ id, slug }, index) => {
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
