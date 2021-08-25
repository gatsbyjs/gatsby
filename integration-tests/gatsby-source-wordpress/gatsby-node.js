exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type WpPage {
      beforeChangeNodeTest: String
    }
  `
  createTypes(typeDefs)
}
