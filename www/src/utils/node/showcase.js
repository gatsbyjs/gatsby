const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const slugify = require(`slugify`)
const url = require(`url`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const showcaseTemplate = path.resolve(
    `src/templates/template-showcase-details.js`
  )

  const { data, errors } = await graphql(`
    query {
      allSitesYaml(filter: { main_url: { ne: null } }) {
        nodes {
          main_url
          fields {
            slug
            hasScreenshot
          }
        }
      }
    }
  `)
  if (errors) throw errors

  data.allSitesYaml.nodes.forEach(node => {
    if (!node.fields) return
    if (!node.fields.slug) return
    if (!node.fields.hasScreenshot) {
      reporter.warn(
        `Site showcase entry "${node.main_url}" seems offline. Skipping.`
      )
      return
    }
    createPage({
      path: `${node.fields.slug}`,
      component: slash(showcaseTemplate),
      context: {
        slug: node.fields.slug,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `SitesYaml` && node.main_url) {
    const parsed = url.parse(node.main_url)
    const cleaned = parsed.hostname + parsed.pathname
    slug = `/showcase/${slugify(cleaned)}`
    createNodeField({ node, name: `slug`, value: slug })

    // determine if screenshot is available
    const screenshotNode = node.children
      .map(childID => getNode(childID))
      .find(node => node.internal.type === `Screenshot`)

    createNodeField({ node, name: `hasScreenshot`, value: !!screenshotNode })
  }
}
