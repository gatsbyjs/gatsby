const { GraphQLObjectType, GraphQLNonNull } = require(`gatsby/graphql`)
const {
  mapSchema,
  MapperKind,
  addTypes,
  modifyObjectFields,
} = require(`@graphql-tools/utils`)

class NamespaceUnderFieldTransform {
  constructor({ typeName, fieldName, resolver }) {
    this.typeName = typeName
    this.fieldName = fieldName
    this.resolver = resolver
  }

  transformSchema(schema) {
    const queryConfig = schema.getQueryType().toConfig()

    const nestedQuery = new GraphQLObjectType({
      ...queryConfig,
      name: this.typeName,
    })

    let newSchema = addTypes(schema, [nestedQuery])

    const newRootFieldConfigMap = {
      [this.fieldName]: {
        type: new GraphQLNonNull(nestedQuery),
        resolve: (parent, args, context, info) => {
          if (this.resolver != null) {
            return this.resolver(parent, args, context, info)
          }

          return {}
        },
      },
    }

    ;[newSchema] = modifyObjectFields(
      newSchema,
      queryConfig.name,
      () => true,
      newRootFieldConfigMap
    )

    return newSchema
  }
}

class StripNonQueryTransform {
  transformSchema(schema) {
    return mapSchema(schema, {
      [MapperKind.MUTATION]() {
        return null
      },
      [MapperKind.SUBSCRIPTION]() {
        return null
      },
    })
  }
}

module.exports = {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
}
