const {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require(`graphql`)
const GraphQLJSON = require(`graphql-type-json`)
const { stripIndent, oneLine } = require(`common-tags`)

const PropDefaultValue = new GraphQLObjectType({
  name: `PropDefaultValue`,
  fields: () => {
    return {
      value: { type: GraphQLString },
      computed: { type: GraphQLBoolean },
    }
  },
})

const PropTypeValue = new GraphQLObjectType({
  name: `PropTypeValue`,
  fields: () => {
    return {
      name: { type: new GraphQLNonNull(GraphQLString) },
      value: { type: GraphQLJSON },
      raw: { type: GraphQLString },
    }
  },
})

const Method = new GraphQLObjectType({
  name: `ComponentMethod`,
  fields: () => {
    return {
      name: { type: new GraphQLNonNull(GraphQLString) },
      docblock: {
        type: GraphQLString,
        description: oneLine`
        The raw comment block leading a method declaration
      `,
      },
      modifiers: {
        type: new GraphQLList(GraphQLString),
        description: oneLine`
        Modifiers describing the kind and sort of method e.g. "static",
        "generator", or "async".
      `,
      },
      params: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: `ComponentMethodParams`,
            fields: () => {
              return {
                name: { type: GraphQLString },
                type: { type: GraphQLJSON },
              }
            },
          })
        ),
      },
      returns: { type: new GraphQLList(GraphQLJSON) },
    }
  },
})

function extendComponents() {
  return {
    composes: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: stripIndent`
        ${oneLine`
        A list of additional modules "spread" into this component's
        propTypes such as:`}

        propTypes = {
          name: PropTypes.string,
          ...AnotherComponent.propTypes,
        }
      `,
    },
    methods: {
      type: new GraphQLList(Method),
      description: `Component methods`,
    },
  }
}

function extendProp() {
  return {
    type: { type: PropTypeValue },
    defaultValue: { type: PropDefaultValue },
    docblock: {
      type: GraphQLString,
      description: oneLine`
        The raw comment block leading a propType declaration
      `,
    },
    required: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({ required }) => required || false,
      description: oneLine`
        Describes whether or not the propType is required, i.e. not \`null\`
      `,
    },
  }
}

export default ({ type }) => {
  if (type.name === `ComponentProp`) return extendProp()
  if (type.name === `ComponentMetadata`) return extendComponents()
  return {}
}
