exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === "ContentfulContentTypeText") {
    createNodeField({
      node,
      name: "customField",
      value: "customFieldValue",
    })
  }
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions

  const typeDefs = `
    type ContentfulContentTypeTextFields {
      customField: String!
    }
    type ContentfulContentTypeText {
      fields: ContentfulContentTypeTextFields!
    }
  `

  createTypes(typeDefs)
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    ContentfulContentTypeText: {
      customResolver: {
        type: 'String!',
        resolve(source, args, context, info) {
          return "customResolverResult"
        },
      },
    },
  })
}