const fs = require(`fs-extra`)
const yaml = require(`js-yaml`)
const ecosystemFeaturedItems = yaml.load(
  fs.readFileSync(`./src/data/ecosystem/featured-items.yaml`)
)

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `NPMPackage`) {
    if (ecosystemFeaturedItems.plugins.includes(node.name)) {
      createNodeField({ node, name: `featured`, value: true })
    }
  }
}
