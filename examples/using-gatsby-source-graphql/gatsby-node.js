const path = require(`path`)
const { makeBlogPath } = require(`./src/utils`)

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

  return Promise.all(
    data.cms.blogPosts.map(blog =>
      actions.createPage({
        path: makeBlogPath(blog),
        component: path.resolve(`./src/components/blog-post.js`),
        context: {
          blogId: blog.id,
        },
      })
    )
  )
}
