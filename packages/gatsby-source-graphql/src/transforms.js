const { GraphQLObjectType, GraphQLNonNull } = require(`gatsby/graphql`)
const {
  VisitSchemaKind,
  cloneType,
  healSchema,
  visitSchema,
} = require(`graphql-tools-fork`)

class NamespaceUnderFieldTransform {
  constructor({ typeName, fieldName, resolver }) {
    this.typeName = typeName
    this.fieldName = fieldName
    this.resolver = resolver
  }

  transformSchema(schema) {
    const query = schema.getQueryType()

    const nestedType = new cloneType(query)
    nestedType.name = this.typeName

    const typeMap = schema.getTypeMap()
    typeMap[this.typeName] = nestedType

    const newQuery = new GraphQLObjectType({
      name: query.name,
      fields: {
        [this.fieldName]: {
          type: new GraphQLNonNull(nestedType),
          resolve: (parent, args, context, info) => {
            if (this.resolver) {
              return this.resolver(parent, args, context, info)
            } else {
              return {}
            }
          },
        },
      },
    })
    typeMap[query.name] = newQuery

    return healSchema(schema)
  }
}

class StripNonQueryTransform {
  transformSchema(schema) {
    return visitSchema(schema, {
      [VisitSchemaKind.MUTATION]() {
        return null
      },
      [VisitSchemaKind.SUBSCRIPTION]() {
        return null
      },
    })
  }
}

module.exports = {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
}
