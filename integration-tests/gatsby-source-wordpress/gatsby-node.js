exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type WpPage {
      beforeChangeNodeTest: String
    }
    type WpPost {
      beforeChangeNodeTest: String
    }
  `
  createTypes(typeDefs)
}
