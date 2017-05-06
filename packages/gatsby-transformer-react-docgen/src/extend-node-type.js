const {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const GraphQLJSON = require(`graphql-type-json`)

function resolve(field) {
  return obj => JSON.parse(obj.content)[field]
}

const PropDefaultValue = new GraphQLObjectType({
  name: `PropDefaultValue`,
  fields: () => ({
    value: { type: GraphQLJSON },
    computed: { type: GraphQLBoolean },
  }),
})

const Method = new GraphQLObjectType({
  name: `ComponentMethod`,
  fields: () => ({
    name: { type: GraphQLString },
    docblock: { type: GraphQLString },
    modifiers: { type: new GraphQLList(GraphQLJSON) },
    params: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: `ComponentMethodParams`,
          fields: () => ({
            name: { type: GraphQLString },
            type: { type: GraphQLJSON },
          }),
        })
      ),
    },
    returns: { type: new GraphQLList(GraphQLJSON) },
  }),
})

function extendComponents() {
  return {
    doclets: {
      type: GraphQLJSON,
      resolve: resolve(`doclets`),
    },
    composes: {
      type: new GraphQLList(GraphQLString),
      resolve: resolve(`composes`),
    },
    methods: {
      type: new GraphQLList(Method),
      resolve: resolve(`methods`),
    },
  }
}

function extendProp() {
  return {
    name: { type: GraphQLString, resolve: resolve(`name`) },
    doclets: { type: GraphQLJSON, resolve: resolve(`doclets`) },
    defaultValue: { type: PropDefaultValue, resolve: resolve(`defaultValue`) },
    required: { type: GraphQLBoolean, resolve: resolve(`required`) },
    type: { type: GraphQLJSON, resolve: resolve(`type`) },
  }
}

export default ({ type }) => {
  if (type.name === `ComponentProp`) return extendProp()
  if (type.name === `ComponentMetadata`) return extendComponents()
  return {}
}
