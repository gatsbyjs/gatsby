const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
} = require(`gatsby/graphql`)
const { visitSchema, VisitSchemaKind } = require(`graphql-tools-fork`)
const {
  createResolveType,
  fieldMapToFieldConfigMap,
} = require(`graphql-tools-fork`)

class NamespaceUnderFieldTransform {
  constructor({ typeName, fieldName, resolver }) {
    this.typeName = typeName
    this.fieldName = fieldName
    this.resolver = resolver
  }

  transformSchema(schema) {
    const query = schema.getQueryType()
    let newQuery
    const nestedType = new GraphQLObjectType({
      name: this.typeName,
      fields: () =>
        fieldMapToFieldConfigMap(
          query.getFields(),
          createResolveType(typeName => {
            if (typeName === query.name) {
              return newQuery
            } else {
              return schema.getType(typeName)
            }
          }),
          true
        ),
    })
    newQuery = new GraphQLObjectType({
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
    const typeMap = schema.getTypeMap()
    const allTypes = Object.keys(typeMap)
      .filter(name => name !== query.name)
      .map(key => typeMap[key])

    return new GraphQLSchema({
      query: newQuery,
      types: allTypes,
    })
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
