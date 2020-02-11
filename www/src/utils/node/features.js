const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const {
  generateComparisonPageSet,
} = require(`../generate-comparison-page-set.js`)

exports.createPages = async ({ actions }) => {
  const { createPage } = actions

  const featureComparisonPageTemplate = path.resolve(
    `src/templates/template-feature-comparison.js`
  )

  // Create feature comparison pages
  const jamstackPages = generateComparisonPageSet(`jamstack`)
  const cmsPages = generateComparisonPageSet(`cms`)
  const comparisonPages = [...jamstackPages, ...cmsPages]
  for (const { path, options, featureType } of comparisonPages) {
    createPage({
      path,
      component: slash(featureComparisonPageTemplate),
      context: {
        options,
        featureType,
      },
    })
  }
}

exports.onCreateNode = helpers => {}
