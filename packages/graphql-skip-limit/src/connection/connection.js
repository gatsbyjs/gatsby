/* @flow */

import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
} from "graphql"

import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  Thunk,
} from "graphql"

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
export const connectionArgs: GraphQLFieldConfigArgumentMap = {
  skip: {
    type: GraphQLInt,
  },
  limit: {
    type: GraphQLInt,
  },
}

type ConnectionConfig = {
  name?: ?string,
  nodeType: GraphQLObjectType,
  resolveNode?: ?GraphQLFieldResolver<*, *>,
  edgeFields?: ?Thunk<GraphQLFieldConfigMap<*, *>>,
  connectionFields?: ?Thunk<GraphQLFieldConfigMap<*, *>>,
}

type GraphQLConnectionDefinitions = {
  edgeType: GraphQLObjectType,
  connectionType: GraphQLObjectType,
}

/**
 * The common page info type used by all connections.
 */
const pageInfoType = new GraphQLObjectType({
  name: `PageInfo`,
  description: `Information about pagination in a connection.`,
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: `When paginating, are there more items?`,
    },
  }),
})

function resolveMaybeThunk<T>(thingOrThunk: Thunk<T>): T {
  return typeof thingOrThunk === `function` ? thingOrThunk() : thingOrThunk
}

/**
 * Returns a GraphQLObjectType for a connection with the given name,
 * and whose nodes are of the specified type.
 */
export function connectionDefinitions(
  config: ConnectionConfig
): GraphQLConnectionDefinitions {
  const { nodeType } = config
  const name = config.name || nodeType.name
  const edgeFields = config.edgeFields || {}
  const connectionFields = config.connectionFields || {}
  const resolveNode = config.resolveNode
  const edgeType = new GraphQLObjectType({
    name: `${name}Edge`,
    description: `An edge in a connection.`,
    fields: () => ({
      node: {
        type: nodeType,
        resolve: resolveNode,
        description: `The item at the end of the edge`,
      },
      next: {
        type: nodeType,
        resolve: resolveNode,
        description: `The next edge in the connection`,
      },
      previous: {
        type: nodeType,
        resolve: resolveNode,
        description: `The previous edge in the connection`,
      },
      ...(resolveMaybeThunk(edgeFields): any),
    }),
  })

  const connectionType = new GraphQLObjectType({
    name: `${name}Connection`,
    description: `A connection to a list of items.`,
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(pageInfoType),
        description: `Information to aid in pagination.`,
      },
      edges: {
        type: new GraphQLList(edgeType),
        description: `A list of edges.`,
      },
      ...(resolveMaybeThunk(connectionFields): any),
    }),
  })

  return { edgeType, connectionType }
}
