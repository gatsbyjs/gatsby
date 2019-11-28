import { createGatsbyNodesFromWPGQLContentNodes } from "./create-nodes"
import paginatedWpNodeFetch from "./paginated-wp-node-fetch"

import { CREATED_NODE_IDS } from "../constants"
import { schemaStore } from "../on-pre-bootstrap"

export const fetchWPGQLContentNodes = async (_, helpers, { url }) => {
  const { reporter } = helpers
  const contentNodeGroups = []

  const { queries } = schemaStore.getState().introspection

  await Promise.all(
    Object.entries(queries).map(
      ([fieldName, queryInfo]) =>
        new Promise(async resolve => {
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

          return resolve()
        })
    )
  )

  return contentNodeGroups
}

export const fetchAndCreateAllNodes = async (_, helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  const { reporter, cache } = helpers

  let activity

  //
  // fetch nodes from WPGQL
  activity = reporter.activityTimer(`[gatsby-source-wordpress] fetch content`)
  activity.start()

  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(_, ...api)

  activity.end()

  //
  // Create Gatsby nodes from WPGQL response
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
