const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLString,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const { link } = require(`../resolvers`)

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
    field.resolve = link({ by })
  }
}

module.exports = [LinkNodeDirective, { link: LinkNodeDirectiveVisitor }]
