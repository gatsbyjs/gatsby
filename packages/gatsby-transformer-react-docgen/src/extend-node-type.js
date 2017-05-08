import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import { stripIndent } from 'common-tags'

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
    modifiers: {
      type: new GraphQLList(GraphQLString),
      description: `Modifiers describing the kind and sort of method e.g. "static", ` +
        `"generator", or "async".`,
    },
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
    composes: {
      type: new GraphQLList(GraphQLString),
      description: stripIndent`
        A list of additional modules "spread" into this component's
        propTypes such as:

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
    defaultValue: { type: PropDefaultValue },
    required: {
      type: GraphQLBoolean,
      description: `Describes whether or not the propType is required, i.e. not \`null\``,
    },
    //propType: { type: GraphQLJSON },
  }
}

export default ({ type }) => {
  if (type.name === `ComponentProp`) return extendProp()
  if (type.name === `ComponentMetadata`) return extendComponents()
  return {}
}
