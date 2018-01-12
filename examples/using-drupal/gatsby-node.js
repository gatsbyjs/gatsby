const path = require(`path`)

// Create a slug for each recipe and set it as a field on the node.
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `recipes`) {
    const slug = `/recipes/${node.internalId}/`
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const recipeTemplate = path.resolve(`src/templates/recipe.js`)
    // Query for recipe nodes to use in creating pages.
    resolve(
      graphql(
        `
          {
            allRecipes {
              edges {
                node {
                  internalId
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create pages for each recipe.
        result.data.allRecipes.edges.forEach(({ node }) => {
          createPage({
            path: node.fields.slug,
            component: recipeTemplate,
            context: {
              slug: node.fields.slug,
            },
          })
        })
      })
    )
  })
}
