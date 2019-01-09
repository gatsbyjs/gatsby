const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLList,
  GraphQLString,
  getNamedType,
  getNullableType,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const { findMany, findOne, link } = require(`../resolvers`)

const LinkNodeDirective = new GraphQLDirective({
  name: `link`,
  locations: [DirectiveLocation.FIELD_DEFINITION],
  args: {
    by: { type: GraphQLString, defaultValue: `id` },
  },
})

class LinkNodeDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { by } = this.args
    const { type } = field // info.returnType

    const nullableType = getNullableType(type)

    const resolver = (nullableType instanceof GraphQLList ? findMany : findOne)(
      getNamedType(nullableType).name
    )

    field.resolve = link({ by })(resolver)
  }
}

module.exports = [LinkNodeDirective, { link: LinkNodeDirectiveVisitor }]
