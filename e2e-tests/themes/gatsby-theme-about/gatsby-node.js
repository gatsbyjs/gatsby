const bioTemplate = require.resolve(`./src/templates/bio.js`)
const postTemplate = require.resolve(`./src/templates/post.jsx`)

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`There was an error loading your posts or pages`, result.errors)
    return
  }

  const posts = result.data.allMdx.nodes

  posts.forEach((post) => {
    createPage({
      path: post.frontmatter.slug,
      component: `${postTemplate}?__contentFilePath=${post.internal.contentFilePath}`,
      context: {
        id: post.id,
      },
    })
  })

  createPage({
    path: `/bio`,
    component: bioTemplate,
  })
}
