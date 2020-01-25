import chunk from "lodash/chunk"
import store from "~/store"
import atob from "atob"
import { createRemoteMediaItemNode } from "../create-nodes/create-remote-media-item-node"
import { formatLogMessage } from "~/utils/format-log-message"
import { paginatedWpNodeFetch } from "./fetch-nodes-paginated"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"

export default async function fetchReferencedMediaItemsAndCreateNodes({
  referencedMediaItemNodeIds,
}) {
  const state = store.getState()
  const queryInfo = state.remoteSchema.nodeQueries.mediaItems

  const { helpers, pluginOptions } = state.gatsbyApi
  const { createContentDigest, actions } = helpers
  const { reporter } = helpers
  const { url, verbose } = pluginOptions
  const { typeInfo, settings, selectionSet } = queryInfo

  let allMediaItemNodes = []

  if (settings.limit && settings.limit < referencedMediaItemNodeIds.length) {
    referencedMediaItemNodeIds = referencedMediaItemNodeIds.slice(
      0,
      settings.limit
    )
  }

  const nodesPerFetch = 100
  const chunkedIds = chunk(referencedMediaItemNodeIds, nodesPerFetch)

  const activity = reporter.activityTimer(
    formatLogMessage(typeInfo.nodesTypeName)
  )

  if (verbose) {
    activity.start()
  }

  const allContentNodes = []

  for (const relayIds of chunkedIds) {
    // relay id's are base64 encoded from strings like attachment:89381
    // where 89381 is the id we want for our query
    // so we split on the : and get the last item in the array, which is the id
    // once we can get a list of media items by relay id's, we can remove atob
    const ids = relayIds.map(
      id =>
        atob(id)
          .split(`:`)
          .slice(-1)[0]
    )

    const query = `
      query MEDIA_ITEMS($in: [ID]) {
        mediaItems(first: ${nodesPerFetch}, where:{ in: $in }) {
          nodes {
            ${selectionSet}
          }
        }
      }
    `

    const allNodesOfContentType = await paginatedWpNodeFetch({
      first: nodesPerFetch,
      contentTypePlural: typeInfo.pluralName,
      nodeTypeName: typeInfo.nodesTypeName,
      query,
      url,
      activity,
      helpers,
      settings,
      allContentNodes,
      in: ids,
    })

    allMediaItemNodes = [...allMediaItemNodes, ...allNodesOfContentType]
  }

  if (!allMediaItemNodes || !allMediaItemNodes.length) {
    return
  }

  await Promise.all(
    allMediaItemNodes.map(async node => {
      const remoteFile = await createRemoteMediaItemNode({
        mediaItemNode: node,
        helpers,
      })

      node = {
        ...node,
        remoteFile: {
          id: remoteFile.id,
        },
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: buildTypeName(`MediaItem`),
        },
      }

      await actions.createNode(node)
    })
  )

  if (verbose) {
    activity.end()
  }
}
