import { createGatsbyNodesFromWPGQLContentNodes } from "./create-nodes"
import paginatedWpNodeFetch from "./paginated-wp-node-fetch"
import formatLogMessage from "../../utils/format-log-message"
import { CREATED_NODE_IDS } from "../constants"
import store from "../../store"
import { getGatsbyApi } from "../../utils/get-gatsby-api"

export const fetchWPGQLContentNodes = async ({
  queryInfo,
  test,
  variables,
  allContentNodes = [],
}) => {
  const { pluginOptions, helpers } = store.getState().gatsbyApi
  const { reporter } = helpers
  const { url, verbose } = pluginOptions

  const { listQueryString, typeInfo, settings } = queryInfo

  const activity = reporter.activityTimer(
    formatLogMessage(typeInfo.nodesTypeName)
  )

  if (verbose) {
    activity.start()
  }

  const allNodesOfContentType = await paginatedWpNodeFetch({
    first: 100,
    after: null,
    contentTypePlural: typeInfo.pluralName,
    nodeTypeName: typeInfo.nodesTypeName,
    query: listQueryString,
    url,
    activity,
    helpers,
    settings,
    test,
    allContentNodes,
    ...variables,
  })

  if (verbose) {
    activity.end()
  }

  if (allNodesOfContentType && allNodesOfContentType.length) {
    return {
      singular: queryInfo.singleName,
      plural: queryInfo.pluralName,
      allNodesOfContentType,
    }
  }

  return false
}

export const getContentTypeQueryInfos = () => {
  const { queries } = store.getState().introspection
  const queryInfos = Object.values(queries).filter(
    ({ settings }) => !settings.exclude
  )
  return queryInfos
}

export const fetchWPGQLContentNodesByContentType = async () => {
  const contentNodeGroups = []

  const queries = getContentTypeQueryInfos()

  await Promise.all(
    queries.map(async queryInfo => {
      if (queryInfo.settings.onlyFetchIfReferenced) {
        return
      }

      const contentNodeGroup = await fetchWPGQLContentNodes({ queryInfo })

      if (contentNodeGroup) {
        contentNodeGroups.push(contentNodeGroup)
      }
    })
  )

  return contentNodeGroups
}

export const fetchAndCreateAllNodes = async () => {
  const { helpers, pluginOptions } = getGatsbyApi()

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

  const wpgqlNodesByContentType = await fetchWPGQLContentNodesByContentType()

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

  // const downloadHtmlImages = false

  // this downloads images in html.
  // one problem is that we can't get media items by source url in WPGraphQL
  // before doing this, we'll need something to change on the WPGQL side
  // if (downloadHtmlImages) {
  //   // these are image urls that were used in other nodes we created
  //   const fileUrls = Array.from(store.getState().imageNodes.urls)

  //   // these are file metadata nodes we've already fetched
  //   const mediaItemNodes = helpers.getNodesByType(`WpMediaItem`)

  //   // build an object where the media item urls are properties,
  //   // and media item nodes are values
  //   // so we can check if the urls we regexed from our other nodes content
  //   // are media item nodes
  //   const mediaItemNodesKeyedByUrl = mediaItemNodes.reduce((acc, curr) => {
  //     acc[curr.mediaItemUrl] = curr
  //     return acc
  //   }, {})
  //   // const mediaItemNodesKeyedByUrl = store.getState().imageNodes.nodeMetaByUrl

  //   await Promise.all(
  //     fileUrls.map(async url => {
  //       // check if we have a media item node for this regexed url
  //       const mediaItemNode = mediaItemNodesKeyedByUrl[url]

  //       if (mediaItemNode) {
  //         // create remote file node from media node
  //         await createRemoteMediaItemNode({
  //           mediaItemNode,
  //           helpers,
  //         })
  //       }
  //     })
  //   )
  // }

  activity.end()
}
