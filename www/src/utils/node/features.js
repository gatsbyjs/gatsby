const { generateComparisonPageSet } = require(`../generate-comparison-page-set`)
const { getTemplate } = require(`../get-template`)

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
    type GatsbyJamstackSpecsCsv implements Node @dontInfer {
      Category: String
      Subcategory: String
      Feature: String
      Gatsby: String
      Nextjs: String
      Jekyll: String
      Hugo: String
      Nuxtjs: String
      Description: String
    }

    type GatsbyCmsSpecsCsv implements Node @dontInfer {
      Category: String
      Subcategory: String
      Feature: String
      Gatsby: String
      WordPress: String
      Drupal: String
      Description: String
    }

    type GatsbyFeaturesSpecsCsv implements Node @dontInfer {
      Category: String
      Gatsby: String
      Jamstack: String
      Cms: String
      Description: String
    }
  `)
}

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
