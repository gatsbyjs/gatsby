const path = require("path")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allPagesJson {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
  result.data.allPagesJson.edges.forEach(({ node }) => {
    // Create Post page with Redux Provider in it.
    createPage({
      path: node.slug,
      component: path.resolve(`./src/templates/post.js`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
      },
    })

    // Create same page with no Redux provider.
    createPage({
      path: `other/${node.slug}`,
      component: path.resolve(`./src/templates/other-page.js`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
      },
    })
  })
}
