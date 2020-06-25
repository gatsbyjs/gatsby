const { makeExecutableSchema } = require(`@graphql-tools/schema`)
const { SchemaDirectiveVisitor } = require(`@graphql-tools/utils`)

const gqlFieldsToObject = fields =>
  Object.entries(fields).reduce((acc, [key, value]) => {
    acc[key] = {
      type: value.type,
      metadata: value.metadata,
    }
    return acc
  }, {})

class MetadataDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    field.metadata = this.args
  }
}

const makeMetadataDirective = metadata => {
  if (!metadata || !metadata.length) {
    return ``
  }

  const metadataArgs = metadata.map(tag => `${tag}: String`).join(`\n`)

  return `
    directive @metadata(
      ${metadataArgs}
    ) on FIELD_DEFINITION
  `
}

// TODO: Support relations/collections for mapping schema to CMS
//       content models for providers.
module.exports = (typeDefs, { metadata } = {}) => {
  const metadataDirective = makeMetadataDirective(metadata)

  const { _typeMap: typeMap } = makeExecutableSchema({
    typeDefs: metadataDirective + typeDefs,
    schemaDirectives: {
      metadata: MetadataDirective,
    },
  })

  return Object.entries(typeMap)
    .filter(([key, value]) => {
      if (key.startsWith(`_`) || !value._fields) {
        return false
      }

      return true
    })
    .map(([key, value]) => {
      return {
        name: key,
        fields: gqlFieldsToObject(value._fields),
      }
    })
}
