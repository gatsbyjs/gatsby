const path = require(`path`)
const { makeBlogPath } = require("./src/utils")

exports.createPages = async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query {
      cms {
        blogPosts(where: { status: PUBLISHED }) {
          id
          title
          createdAt
          slug
        }
      }
    }
  `)

  data.cms.blogPosts.forEach(blog => {
    actions.createPage({
      path: makeBlogPath(blog),
      component: path.resolve(`./src/components/BlogPost.js`),
      context: {
        blogId: blog.id,
      },
    })
  })
}
