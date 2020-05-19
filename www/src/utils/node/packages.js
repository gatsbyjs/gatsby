const path = require(`path`)
const fs = require(`fs-extra`)
const { slash } = require(`gatsby-core-utils`)
const isOfficialPackage = require(`../is-official-package`)
const yaml = require(`js-yaml`)
const { plugins: featuredPlugins } = yaml.load(
  fs.readFileSync(`./src/data/ecosystem/featured-items.yaml`)
)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const packageTemplate = path.resolve(
    `src/templates/template-package-readme.js`
  )

  const { data, errors } = await graphql(`
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
      component: slash(packageTemplate),
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
