const path = require("path")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          slug
          frontmatter {
            title # used in prev/next
          }
          parent {
            ... on File {
              id
              name
              absolutePath
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const posts = result.data.allMdx.nodes

  posts.forEach(({ id, slug, parent }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1]
    const next = index === 0 ? null : posts[index - 1]

    createPage({
      path: slug,
      component: `${path.resolve(
        `./src/templates/blog-post.js`
      )}?__contentFilePath=${parent.absolutePath}`,
      context: {
        id,
        slug,
        previous,
        next,
      },
    })
  })
}
