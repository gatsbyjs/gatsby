import { createGatsbyNodesFromWPGQLContentNodes } from "./create-nodes"
import paginatedWpNodeFetch from "./paginated-wp-node-fetch"

import { CREATED_NODE_IDS } from "../constants"

import { buildNodeQueriesFromIntrospection } from "./generate-queries-from-introspection"

export const fetchWPGQLContentNodes = async ({ queries }, helpers, { url }) => {
  const { reporter } = helpers
  const contentNodeGroups = []

  for (const [fieldName, queryInfo] of Object.entries(queries)) {
    const { queryString, typeInfo } = queryInfo

    const activity = reporter.activityTimer(
      `[gatsby-source-wordpress] -> fetching all ${typeInfo.pluralName}`
    )
    activity.start()
    const allNodesOfContentType = await paginatedWpNodeFetch({
      first: 100,
      after: null,
      contentTypePlural: typeInfo.pluralName,
      contentTypeSingular: typeInfo.singleName,
      nodeTypeName: typeInfo.nodesTypeName,
      url,
      query: queryString,
      activity,
      helpers,
    })
    activity.end()

    if (allNodesOfContentType && allNodesOfContentType.length) {
      contentNodeGroups.push({
        singular: fieldName,
        plural: fieldName,
        allNodesOfContentType,
      })
    }
  }

  // this fetches multiple endpoints at once
  // await Promise.all(
  //   Object.entries(queryStrings).map(
  //     ([fieldName, query]) =>
  //       new Promise(async resolve => {
  //         const allNodesOfContentType = await paginatedWpNodeFetch({
  //           first: 10,
  //           after: null,
  //           contentTypePlural: fieldName,
  //           contentTypeSingular: fieldName,
  //           url,
  //           query,
  //         })

  //         if (allNodesOfContentType && allNodesOfContentType.length) {
  //           contentNodeGroups.push({
  //             singular: fieldName,
  //             plural: fieldName,
  //             allNodesOfContentType,
  //           })
  //         }

  //         return resolve()
  //       })
  //   )
  // )

  return contentNodeGroups
}

export const fetchAndCreateAllNodes = async (_, helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  const { reporter, cache } = helpers

  let activity

  //
  // Introspect schema and build gql queries
  activity = reporter.activityTimer(
    `[gatsby-source-wordpress] introspect schema`
  )
  activity.start()
  const queries = await buildNodeQueriesFromIntrospection(...api)
  await cache.set(`node-queries`, queries)
  activity.end()

  activity = reporter.activityTimer(`[gatsby-source-wordpress] fetch content`)
  activity.start()
  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(
    { queries },
    ...api
  )
  activity.end()

  //
  // Create nodes
  activity = reporter.activityTimer(`[gatsby-source-wordpress] create nodes`)
  activity.start()
  const createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes(
    {
      wpgqlNodesByContentType,
    },
    ...api
  )

  // save the node id's so we can touch them on the next build
  // so that we don't have to refetch all nodes
  await cache.set(CREATED_NODE_IDS, createdNodeIds)
  activity.end()
}
