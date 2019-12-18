import { createGatsbyNodesFromWPGQLContentNodes } from "./create-nodes"
import paginatedWpNodeFetch from "./paginated-wp-node-fetch"
import formatLogMessage from "../../utils/format-log-message"
import { CREATED_NODE_IDS } from "../constants"
import store from "../../store"
import { createRemoteMediaItemNode } from "./create-remote-media-item-node"

export const fetchWPGQLContentNodes = async (helpers, { url, verbose }) => {
  const { reporter } = helpers
  const contentNodeGroups = []

  const { queries } = store.getState().introspection

  await Promise.all(
    Object.entries(queries).map(async ([fieldName, queryInfo]) => {
      const { listQueryString, typeInfo, settings } = queryInfo

      if (settings.exclude) {
        return
      }

      const activity = reporter.activityTimer(
        formatLogMessage(typeInfo.pluralName)
      )

      if (verbose) {
        activity.start()
      }

      const allNodesOfContentType = await paginatedWpNodeFetch({
        first: 100,
        after: null,
        contentTypePlural: typeInfo.pluralName,
        contentTypeSingular: typeInfo.singleName,
        nodeTypeName: typeInfo.nodesTypeName,
        url,
        query: listQueryString,
        activity,
        helpers,
        settings,
      })

      if (verbose) {
        activity.end()
      }

      if (allNodesOfContentType && allNodesOfContentType.length) {
        contentNodeGroups.push({
          singular: fieldName,
          plural: fieldName,
          allNodesOfContentType,
        })
      }
    })
  )

  return contentNodeGroups
}

export const fetchAndCreateAllNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  const { reporter, cache } = helpers

  //
  // fetch nodes from WPGQL
  const activity = reporter.activityTimer(
    formatLogMessage`fetch and create nodes`
  )
  activity.start()

  store.subscribe(() => {
    activity.setStatus(`created ${store.getState().logger.entityCount}`)
  })

  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(...api)

  //
  // Create Gatsby nodes from WPGQL response
  const createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes(
    {
      wpgqlNodesByContentType,
    },
    ...api
  )

  // save the node id's so we can touch them on the next build
  // so that we don't have to refetch all nodes
  await cache.set(CREATED_NODE_IDS, createdNodeIds)

  const downloadAllReferencedImages = true

  // this downloads any referenced image upfront,
  // instead of as images are queried for
  // the only reason to download them all upfront is to not break
  // the cli output...
  if (downloadAllReferencedImages) {
    // these are image urls that were used in other nodes we created
    const fileUrls = Array.from(store.getState().imageNodes.urls)

    // these are file metadata nodes we've already fetched
    const mediaItemNodes = helpers.getNodesByType(`WpMediaItem`)

    // build an object where the media item urls are properties,
    // and media item nodes are values
    // so we can check if the urls we regexed from our other nodes content
    // are media item nodes
    const mediaItemNodesKeyedByUrl = mediaItemNodes.reduce((acc, curr) => {
      acc[curr.mediaItemUrl] = curr
      return acc
    }, {})
    // const mediaItemNodesKeyedByUrl = store.getState().imageNodes.nodeMetaByUrl

    await Promise.all(
      fileUrls.map(async url => {
        // check if we have a media item node for this regexed url
        const mediaItemNode = mediaItemNodesKeyedByUrl[url]

        if (mediaItemNode) {
          // create remote file node from media node
          await createRemoteMediaItemNode({
            mediaItemNode,
            helpers,
          })
        }
      })
    )
  }

  activity.end()
}
