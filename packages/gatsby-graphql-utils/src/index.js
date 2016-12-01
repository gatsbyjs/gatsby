import {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} from 'graphql-relay'

const {
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} = require(`graphql`)

exports.createConnection = (nodeType, nodesArray) => {
  // Create connection for nodeType
  const { connectionType: typeConnection } =
    connectionDefinitions(
      {
        nodeType,
        connectionFields: () => ({
          totalCount: {
            type: GraphQLInt,
          },
        }),
      }
    )

  return {
    type: typeConnection,
    args: {
      ...connectionArgs,
    },
    resolve (object, args) {
      const result = connectionFromArray(
        nodesArray,
        args,
      )
      result.totalCount = nodesArray.length
      return result
    },
  }
}
const nodeInterface = new GraphQLInterfaceType({
  name: `Node`,
  description: `An object with an id, parent, and children`,
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: `The id of the node.`,
    },
    parent: {
      type: nodeInterface,
      description: `The parent of this node.`,
    },
    children: {
      type: new GraphQLList(nodeInterface),
      description: `The children of this node.`,
    },
  }),
})

exports.nodeInterface = nodeInterface
