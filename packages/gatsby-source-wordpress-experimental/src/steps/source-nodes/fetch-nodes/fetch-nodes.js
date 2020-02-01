import { createGatsbyNodesFromWPGQLContentNodes } from "../create-nodes/create-nodes"
import { paginatedWpNodeFetch } from "./fetch-nodes-paginated"
import { formatLogMessage } from "~/utils/format-log-message"
import { CREATED_NODE_IDS } from "~/constants"
import store from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"

/**
 * fetchWPGQLContentNodes
 *
 * fetches and paginates remote nodes by post type while reporting progress
 */
export const fetchWPGQLContentNodes = async ({ queryInfo, variables }) => {
  const { pluginOptions, helpers } = store.getState().gatsbyApi
  const { reporter } = helpers
  const { url, verbose } = pluginOptions

  const { nodeListQueries, typeInfo, settings } = queryInfo

  const activity = reporter.activityTimer(
    formatLogMessage(typeInfo.nodesTypeName)
  )

  if (verbose) {
    activity.start()
  }

  let allNodesOfContentType = []

  for (const nodeListQuery of nodeListQueries) {
    const contentNodes = await paginatedWpNodeFetch({
      first: 100,
      after: null,
      contentTypePlural: typeInfo.pluralName,
      nodeTypeName: typeInfo.nodesTypeName,
      query: nodeListQuery,
      url,
      activity,
      settings,
      helpers,
      ...variables,
    })

    allNodesOfContentType = [...allNodesOfContentType, ...contentNodes]
  }

  if (verbose) {
    activity.end()
  }

  if (allNodesOfContentType && allNodesOfContentType.length) {
    return {
      singular: queryInfo.typeInfo.singularName,
      plural: queryInfo.typeInfo.pluralName,
      allNodesOfContentType,
    }
  }

  return false
}

/**
 * getContentTypeQueryInfos
 *
 * returns query infos (Type info & GQL query strings) filtered to
 * remove types that are excluded in the plugin options
 *
 * @returns {Array} Type info & GQL query strings
 */
export const getContentTypeQueryInfos = () => {
  const { nodeQueries } = store.getState().remoteSchema
  const queryInfos = Object.values(nodeQueries).filter(
    ({ settings }) => !settings.exclude
  )
  return queryInfos
}

export const getGatsbyNodeTypeNames = () =>
  getContentTypeQueryInfos().map(query => query.typeInfo.nodesTypeName)

/**
 * fetchWPGQLContentNodesByContentType
 *
 * fetches nodes from the remote WPGQL server and groups them by post type
 *
 * @returns {Array}
 */
export const fetchWPGQLContentNodesByContentType = async () => {
  const contentNodeGroups = []

  const nodeQueries = getContentTypeQueryInfos()

  await Promise.all(
    nodeQueries.map(async queryInfo => {
      if (
        // if the type settings call for a lazyNodes, don't fetch them upfront here
        queryInfo.settings.lazyNodes ||
        // if this is a media item and the nodes aren't lazy, we only want to fetch referenced nodes, so we don't fetch all of them here.
        (!queryInfo.settings.lazyNodes &&
          queryInfo.typeInfo.nodesTypeName === `MediaItem`)
      ) {
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

/**
 * fetchAndCreateAllNodes
 *
 * uses query info (generated from introspection in onPreBootstrap) to
 * fetch and create Gatsby nodes from any lists of nodes in the remote schema
 */
export const fetchAndCreateAllNodes = async () => {
  const { helpers } = getGatsbyApi()
  const { reporter, cache } = helpers

  //
  // fetch nodes from WPGQL
  const activity = reporter.activityTimer(
    formatLogMessage(`fetch and create nodes`)
  )
  activity.start()

  store.subscribe(() => {
    activity.setStatus(`created ${store.getState().logger.entityCount}`)
  })

  const wpgqlNodesByContentType = await fetchWPGQLContentNodesByContentType()

  //
  // Create Gatsby nodes from WPGQL response
  const createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes({
    wpgqlNodesByContentType,
  })

  // save the node id's so we can touch them on the next build
  // so that we don't have to refetch all nodes
  await cache.set(CREATED_NODE_IDS, createdNodeIds)

  const downloadHtmlImages = false

  // @todo download remote html images and transform html to use gatsby-image
  if (downloadHtmlImages) {
    // this downloads images in html.
    // one problem is that we can't get media items by source url in WPGraphQL
    // before doing this, we'll need something to change on the WPGQL side
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
  }

  activity.end()
}
