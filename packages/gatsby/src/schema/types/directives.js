const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLDirective,
  GraphQLString,
  DirectiveLocation,
} = require(`graphql`)
const { GraphQLJSON } = require(`graphql-compose`)

const InferDirective = new GraphQLDirective({
  name: `infer`,
  description: `Infer fields for this type from nodes.`,
  locations: [DirectiveLocation.OBJECT],
  args: {
    noDefaultResolvers: {
      type: GraphQLBoolean,
      description: `Don't add default resolvers to defined fields.`,
      deprecationReason: `noDefaultResolvers is deprecated, annotate individual fields.`,
    },
  },
})

const DontInferDirective = new GraphQLDirective({
  name: `dontInfer`,
  description: `Do not infer additional fields for this type from nodes.`,
  locations: [DirectiveLocation.OBJECT],
  args: {
    noDefaultResolvers: {
      type: GraphQLBoolean,
      description: `Don't add default resolvers to defined fields.`,
      deprecationReason: `noDefaultResolvers is deprecated, annotate individual fields.`,
    },
  },
})

const AddResolver = new GraphQLDirective({
  name: `addResolver`,
  description: `Add a resolver specified by "type" to field`,
  locations: [DirectiveLocation.FIELD_DEFINITION],
  args: {
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: `Type of the resolver. Types available by default are: "date", "link" and "relativeFile".`,
    },
    options: {
      type: GraphQLJSON,
      description: `Resolver options. Vary based on resolver type.`,
    },
  },
})

module.exports = {
  InferDirective,
  DontInferDirective,
  AddResolver,
}
