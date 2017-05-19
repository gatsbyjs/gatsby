import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from "graphql"

import { connectionFromArray } from "../arrayconnection.js"

import { connectionArgs, connectionDefinitions } from "../connection.js"

const allUsers = [
  { name: `Dan`, friends: [1, 2, 3, 4] },
  { name: `Nick`, friends: [0, 2, 3, 4] },
  { name: `Lee`, friends: [0, 1, 3, 4] },
  { name: `Joe`, friends: [0, 1, 2, 4] },
  { name: `Tim`, friends: [0, 1, 2, 3] },
]

const userType = new GraphQLObjectType({
  name: `User`,
  fields: () => {
    return {
      name: {
        type: GraphQLString,
      },
      friends: {
        type: friendConnection,
        args: connectionArgs,
        resolve: (user, args) => connectionFromArray(user.friends, args),
      },
    }
  },
})

const { connectionType: friendConnection } = connectionDefinitions({
  name: `Friend`,
  nodeType: userType,
  resolveNode: edge => allUsers[edge.node],
  edgeFields: () => {
    return {
      friendshipTime: {
        type: GraphQLString,
        resolve: () => `Yesterday`,
      },
    }
  },
  connectionFields: () => {
    return {
      totalCount: {
        type: GraphQLInt,
        resolve: () => allUsers.length - 1,
      },
    }
  },
})

const { connectionType: userConnection } = connectionDefinitions({
  nodeType: userType,
  resolveNode: edge => allUsers[edge.node],
})

const queryType = new GraphQLObjectType({
  name: `Query`,
  fields: () => {
    return {
      user: {
        type: userType,
        resolve: () => allUsers[0],
      },
    }
  },
})

const schema = new GraphQLSchema({
  query: queryType,
})

describe(`connectionDefinition()`, () => {
  it(`includes connection and edge fields`, async () => {
    const query = `
      query FriendsQuery {
        user {
          friends(limit: 2) {
            totalCount
            edges {
              friendshipTime
              node {
                name
              }
            }
          }
        }
      }
    `
    const expected = {
      user: {
        friends: {
          totalCount: 4,
          edges: [
            {
              friendshipTime: `Yesterday`,
              node: {
                name: `Nick`,
              },
            },
            {
              friendshipTime: `Yesterday`,
              node: {
                name: `Lee`,
              },
            },
          ],
        },
      },
    }
    const result = await graphql(schema, query)
    expect(result).toEqual({ data: expected })
  })
})
