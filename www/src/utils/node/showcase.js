const slugify = require(`slugify`)
const url = require(`url`)
const { getTemplate } = require(`../get-template`)

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
    type SitesYaml implements Node {
      title: String!
      main_url: String!
      url: String!
      source_url: String
      featured: Boolean
      categories: [String]!
      built_by: String
      built_by_url: String
      description: String
      childScreenshot: Screenshot # added by gatsby-transformer-screenshot
      fields: SitesYamlFields!
    }

    type SitesYamlFields @dontInfer {
      slug: String!
      hasScreenshot: Boolean
    }

    # TODO this should be in gatsby-transformer-screenshot
    type Screenshot implements Node {
      screenshotFile: File
    }
  `)
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

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const showcaseTemplate = getTemplate(`template-showcase-details`)

  const { data, errors } = await graphql(/* GraphQL */ `
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
      component: showcaseTemplate,
      context: {
        slug: node.fields.slug,
      },
    })
  })
}
