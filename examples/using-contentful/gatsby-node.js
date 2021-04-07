const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Contentful graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.
  const pageResult = await graphql(
    `
      {
        allContentfulProduct(limit: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
    `
  )

  if (pageResult.errors) {
    throw pageResult.errors
  }

  // Create Product pages
  const productTemplate = path.resolve(`./src/templates/product.js`)

  // We want to create a detailed page for each
  // product node. We'll just use the Contentful id for the slug.
  await Promise.all(
    pageResult.data.allContentfulProduct.edges.map(edge =>
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.
      createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: `/products/${edge.node.id}/`,
        component: slash(productTemplate),
        context: {
          id: edge.node.id,
        },
      })
    )
  )

  const categoryResult = await graphql(
    `
      {
        allContentfulCategory(limit: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
    `
  )

  if (categoryResult.errors) {
    throw categoryResult.errors
  }

  // Create Category pages
  const categoryTemplate = path.resolve(`./src/templates/category.js`)

  // We want to create a detailed page for each
  // category node. We'll just use the Contentful id for the slug.
  return Promise.all(
    categoryResult.data.allContentfulCategory.edges.map(edge =>
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.
      createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: `/categories/${edge.node.id}/`,
        component: slash(categoryTemplate),
        context: {
          id: edge.node.id,
        },
      })
    )
  )
}
