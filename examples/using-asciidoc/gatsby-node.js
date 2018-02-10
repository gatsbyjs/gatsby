const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)
const asciidoc = require(`asciidoctor.js`)()
const crypto = require(`crypto`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programatically
// create pages.
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against the local Drupal graphql schema. Think of
    // it like the site has a built-in database constructed
    // from the fetched data that you can run queries against.
    graphql(
      `
        {
          allAsciidoc(limit: 1000) {
            edges {
              node {
                id
                slug
              }
            }
          }
        }
      `
    ).then(result => {
      if (result.errors) {
        reject(result.errors)
      }

      // Create Asciidoc pages.
      const articleTemplate = path.resolve(`./src/templates/article.js`)
      _.each(result.data.allAsciidoc.edges, edge => {
        console.log(edge)
        // Gatsby uses Redux to manage its internal state.
        // Plugins and sites can use functions like "createPage"
        // to interact with Gatsby.
        createPage({
          // Each page is required to have a `path` as well
          // as a template component. The `context` is
          // optional but is often necessary so the template
          // can query data specific to each page.
          path: edge.node.slug,
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

exports.onCreateNode = async ({ node, actions, loadNodeContent }) => {
  const { createNode, createParentChildLink } = actions
  if (node.extension === `adoc`) {
    const content = await loadNodeContent(node)
    const html = asciidoc.convert(content)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(html)
      .digest(`hex`)
    const slug = `/${path.parse(node.relativePath).name}/`
    const asciiNode = {
      id: `${node.id} >>> ASCIIDOC`,
      contentDigest,
      parent: node.id,
      type: `Asciidoc`,
      mediaType: `text/html`,
      children: [],
      content: html,
      html,
      slug,
    }

    createNode(asciiNode)
    createParentChildLink({ parent: node, child: asciiNode })
  }
}
