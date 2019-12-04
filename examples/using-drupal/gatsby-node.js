const path = require(`path`)

// Create a slug for each recipe and set it as a field on the node.
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `node__recipe`) {
    const slug = `/recipes/${node.drupal_internal__nid}/`
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

  const recipeTemplate = path.resolve(`src/templates/recipe.js`)
  // Query for recipe nodes to use in creating pages.
  return graphql(
    `
      {
        recipes: allNodeRecipe {
          edges {
            node {
              internalId: drupal_internal__nid
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
      throw result.errors
    }

    // Create pages for each recipe.
    result.data.recipes.edges.forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: recipeTemplate,
        context: {
          slug: node.fields.slug,
        },
      })
    })
  })
}
