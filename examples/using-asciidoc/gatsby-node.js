const _ = require(`lodash`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const { createFilePath } = require(`gatsby-source-filesystem`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Drupal graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.
  return graphql(
    `
      {
        allAsciidoc(limit: 1000) {
          edges {
            node {
              id
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

    // Create Asciidoc pages.
    const articleTemplate = path.resolve(`./src/templates/article.js`)
    _.each(result.data.allAsciidoc.edges, edge => {
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.
      createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: edge.node.fields.slug,
        component: slash(articleTemplate),
        context: {
          id: edge.node.id,
        },
      })
    })
  })
}

exports.onCreateNode = async ({ node, actions, getNode, loadNodeContent }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Asciidoc`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
