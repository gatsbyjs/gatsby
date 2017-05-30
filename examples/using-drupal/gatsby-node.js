const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programatically
// create pages.
exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against the local Drupal graphql schema. Think of
    // it like the site has a built-in database constructed
    // from the fetched data that you can run queries against.
    graphql(
      `
      {
        allDrupalNodeArticle(limit: 1000) {
          edges {
            node {
              id
              nid
            }
          }
        }
      }
    `
    ).then(result => {
      if (result.errors) {
        reject(result.errors)
      }

      // Create HN story pages.
      const articleTemplate = path.resolve(`./src/templates/article.js`)
      // We want to create a detailed page for each
      // article node. We'll just use the Drupal NID for the slug.
      _.each(result.data.allDrupalNodeArticle.edges, edge => {
        // Gatsby uses Redux to manage its internal state.
        // Plugins and sites can use functions like "createPage"
        // to interact with Gatsby.
        createPage({
          // Each page is required to have a `path` as well
          // as a template component. The `context` is
          // optional but is often necessary so the template
          // can query data specific to each page.
          path: `/node/${edge.node.nid}/`,
          component: slash(articleTemplate),
          context: {
            id: edge.node.id,
          },
        })
      })

      resolve()
    })
  })
}
