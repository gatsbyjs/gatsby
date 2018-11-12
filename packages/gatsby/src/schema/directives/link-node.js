const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
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

    let typeWithoutModifiers = type
    let isWrappedInList = false
    while (
      typeWithoutModifiers instanceof GraphQLList ||
      typeWithoutModifiers instanceof GraphQLNonNull
    ) {
      isWrappedInList =
        isWrappedInList || typeWithoutModifiers instanceof GraphQLList
      typeWithoutModifiers = typeWithoutModifiers.ofType
    }

    // TODO: Should `link` be called with the `resolver`,
    // or should this be figured out in `link` itself?
    // We have all we need on `info.returnType`.
    const resolver = (isWrappedInList ? findMany : findOne)(
      typeWithoutModifiers.name
    )

    field.resolve = link({ by })(resolver)
  }
}

module.exports = [LinkNodeDirective, { link: LinkNodeDirectiveVisitor }]
