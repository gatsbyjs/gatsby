const _ = require(`lodash`)
const Promise = require(`bluebird`)
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

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const localPackageTemplate = path.resolve(
      `src/templates/template-docs-local-packages.js`
    )
    const remotePackageTemplate = path.resolve(
      `src/templates/template-docs-remote-packages.js`
    )

    graphql(`
      query {
        allNpmPackage {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

      const allPackages = result.data.allNpmPackage.edges
      // Create package readme
      allPackages.forEach(edge => {
        if (_.includes(localPackagesArr, edge.node.title)) {
          createPage({
            path: edge.node.slug,
            component: slash(localPackageTemplate),
            context: {
              slug: edge.node.slug,
              id: edge.node.id,
              layout: `plugins`,
            },
          })
        } else {
          createPage({
            path: edge.node.slug,
            component: slash(remotePackageTemplate),
            context: {
              slug: edge.node.slug,
              id: edge.node.id,
              layout: `plugins`,
            },
          })
        }
      })
    })

    return resolve()
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
