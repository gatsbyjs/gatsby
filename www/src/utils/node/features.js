const { generateComparisonPageSet } = require(`../generate-comparison-page-set`)
const { getTemplate } = require(`../get-template`)

exports.createPages = async ({ actions }) => {
  const { createPage } = actions

  const featureComparisonPageTemplate = getTemplate(
    `template-feature-comparison`
  )

  // Create feature comparison pages
  const jamstackPages = generateComparisonPageSet(`jamstack`)
  const cmsPages = generateComparisonPageSet(`cms`)
  const comparisonPages = [...jamstackPages, ...cmsPages]
  for (const { path, options, featureType } of comparisonPages) {
    createPage({
      path,
      component: featureComparisonPageTemplate,
      context: {
        options,
        featureType,
      },
    })
  }
}

exports.onCreateNode = () => {}
