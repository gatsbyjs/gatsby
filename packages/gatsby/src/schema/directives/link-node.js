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

    // TODO: Should `link` be called with the `resolver`,
    // or should this be figured out in `link` itself?
    // We have all we need on `info.returnType`.
    // TODO: Do we have to take care of an existing resolver?
    const resolver = (nullableType instanceof GraphQLList ? findMany : findOne)(
      getNamedType(nullableType).name
    )

    field.resolve = link({ by })(resolver)
  }
}

module.exports = [LinkNodeDirective, { link: LinkNodeDirectiveVisitor }]
