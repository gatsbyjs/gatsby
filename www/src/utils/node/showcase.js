const slugify = require(`slugify`)
const url = require(`url`)
// const { getTemplate } = require(`../get-template`)

// exports.createPages = async ({ graphql, actions, reporter }) => {
// const { createPage } = actions
// const showcaseTemplate = getTemplate(`template-showcase-details`)
// const { data, errors } = await graphql(`
//   query {
//     allSitesYaml(filter: { main_url: { ne: null } }) {
//       nodes {
//         main_url
//         fields {
//           slug
//           hasScreenshot
//         }
//       }
//     }
//   }
// `)
// if (errors) throw errors
// data.allSitesYaml.nodes.forEach(node => {
//   if (!node.fields) return
//   if (!node.fields.slug) return
//   if (!node.fields.hasScreenshot) {
//     reporter.warn(
//       `Site showcase entry "${node.main_url}" seems offline. Skipping.`
//     )
//     return
//   }
//   createPage({
//     path: `${node.fields.slug}`,
//     component: showcaseTemplate,
//     context: {
//       slug: node.fields.slug,
//     },
//   })
// })
// }

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `SitesYaml` && node.main_url) {
    const parsed = url.parse(node.main_url)
    const cleaned = slugify(parsed.hostname + parsed.pathname)
    createNodeField({ node, name: `slug`, value: `/showcase/${cleaned}` })
    createNodeField({ node, name: `cleanedHost`, value: cleaned })

    // determine if screenshot is available
    const screenshotNode = node.children
      .map(childID => getNode(childID))
      .find(node => node.internal.type === `Screenshot`)

    createNodeField({ node, name: `hasScreenshot`, value: !!screenshotNode })
  }
}
