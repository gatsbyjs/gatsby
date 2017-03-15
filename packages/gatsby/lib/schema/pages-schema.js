import Promise from "bluebird"
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} from "graphql"
import {
  connectionDefinitions,
  connectionFromArray,
  connectionArgs,
} from "graphql-relay"

import { nodeInterface } from "./node"
import { pagesDB } from "../utils/globals"

module.exports = () =>
  new Promise(resolve => {
    const pageType = new GraphQLObjectType({
      name: `Page`,
      fields: () => ({
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        path: {
          type: GraphQLString,
        },
        component: {
          type: GraphQLString,
        },
      }),
      interfaces: [nodeInterface],
    })

    const { connectionType: pagesConnection } = connectionDefinitions({
      nodeType: pageType,
      connectionFields: () => ({
        totalCount: {
          type: GraphQLInt,
        },
      }),
    })
    return resolve({
      allPages: {
        type: pagesConnection,
        description: `All page configuration objects`,
        args: {
          ...connectionArgs,
        },
        resolve(site, args) {
          const pages = [...pagesDB().values()].map(page => {
            page.id = page.path
            return page
          })
          const result = connectionFromArray(pages, args)
          result.totalCount = pages.length
          return result
        },
      },
    })
  })
