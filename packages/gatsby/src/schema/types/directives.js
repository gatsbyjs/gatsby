const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLDirective,
  DirectiveLocation,
} = require(`graphql`)

const InferDirective = new GraphQLDirective({
  name: `infer`,
  description: `Infer fields for this type from nodes.`,
  locations: [DirectiveLocation.OBJECT],
  args: {
    noDefaultResolvers: {
      type: new GraphQLNonNull(GraphQLBoolean),
      default: false,
      description: `Don't add default resolvers to defined fields.`,
    },
  },
})

const DontInferDirective = new GraphQLDirective({
  name: `dontInfer`,
  description: `Do not infer additional fields for this type from nodes.`,
  locations: [DirectiveLocation.OBJECT],
  args: {
    noDefaultResolvers: {
      type: new GraphQLNonNull(GraphQLBoolean),
      default: false,
      description: `Don't add default resolvers to defined fields.`,
    },
  },
})

module.exports = {
  InferDirective,
  DontInferDirective,
}
