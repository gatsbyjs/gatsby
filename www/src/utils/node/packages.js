const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
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

  const localPackageTemplate = path.resolve(
    `src/templates/template-docs-local-packages.js`
  )
  const remotePackageTemplate = path.resolve(
    `src/templates/template-docs-remote-packages.js`
  )

  const result = await graphql(`
    query {
      allNpmPackage {
        nodes {
          id
          title
          slug
        }
      }
    }
  `)
  if (result.errors) {
    throw result.errors
  }

  const allPackages = result.data.allNpmPackage.nodes
  // Create package readme
  allPackages.forEach(node => {
    if (_.includes(localPackagesArr, node.title)) {
      createPage({
        path: node.slug,
        component: slash(localPackageTemplate),
        context: {
          slug: node.slug,
          id: node.id,
          layout: `plugins`,
        },
      })
    } else {
      createPage({
        path: node.slug,
        component: slash(remotePackageTemplate),
        context: {
          slug: node.slug,
          id: node.id,
          layout: `plugins`,
        },
      })
    }
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `NPMPackage`) {
    if (ecosystemFeaturedItems.plugins.includes(node.name)) {
      createNodeField({ node, name: `featured`, value: true })
    }
  }
}
