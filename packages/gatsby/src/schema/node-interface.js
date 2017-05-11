// @flow
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInterfaceType,
} from "graphql"

export const nodeInterface = new GraphQLInterfaceType({
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
