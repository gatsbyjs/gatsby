const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs-extra`)
const { slash } = require(`gatsby-core-utils`)
const yaml = require(`js-yaml`)
const ecosystemFeaturedItems = yaml.load(
  fs.readFileSync(`./src/data/ecosystem/featured-items.yaml`)
)

const localPackages = `../packages`
const localPackagesArr = []
fs.readdirSync(localPackages).forEach(file => {
  localPackagesArr.push(file)
})

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const packageTemplate = path.resolve(
    `src/templates/template-package-readme.js`
  )

  const { data, errors } = await graphql(`
    query {
      allNpmPackage {
        nodes {
          id
          name
        }
      }
    }
  `)
  if (errors) throw errors

  const allPackages = data.allNpmPackage.nodes
  // Create package readme
  allPackages.forEach(node => {
    if (!node.slug) {
      return
    }
    createPage({
      path: node.slug,
      component: slash(packageTemplate),
      context: {
        slug: node.slug,
        official: _.includes(localPackagesArr, node.name),
      },
    })
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `NPMPackage`) {
    if (ecosystemFeaturedItems.plugins.includes(node.name)) {
      createNodeField({ node, name: `featured`, value: true })
    }

    // createNodeField({ node, name: `slug`, value: `/packages/${node.name}` })
  }
}
