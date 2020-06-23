const isOfficialPackage = require(`../is-official-package`)
const { getTemplate } = require(`../get-template`)
const { loadYaml } = require(`../load-yaml`)
const { plugins: featuredPlugins } = loadYaml(
  `src/data/ecosystem/featured-items.yaml`
)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const packageTemplate = getTemplate(`template-package-readme`)

  const { data, errors } = await graphql(/* GraphQL */ `
    query {
      allNpmPackage {
        nodes {
          name
          slug
        }
      }
    }
  `)
  if (errors) throw errors

  // Create package readme
  data.allNpmPackage.nodes.forEach(node => {
    if (!node.slug) {
      return
    }
    createPage({
      path: node.slug,
      component: packageTemplate,
      context: {
        slug: node.slug,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `NPMPackage`) {
    createNodeField({
      node,
      name: `featured`,
      value: featuredPlugins.includes(node.name),
    })

    createNodeField({
      node,
      name: `official`,
      value: isOfficialPackage(node),
    })
  }
}
