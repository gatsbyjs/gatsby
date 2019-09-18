const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allContentfulBlogPost {
        edges {
          node {
            slug
            title
            childContentfulBlogPostBodyTextNode {
              childMarkdownRemark {
                html
              }
            }
          }
        }
      }
    }
  `)

  result.data.allContentfulBlogPost.edges.forEach(({ node }) => {
    createPage({
      path: `blog/${node.slug}`,
      component: path.resolve(`./src/templates/blog-post.js`),
      context: node,
    })
  })
}
