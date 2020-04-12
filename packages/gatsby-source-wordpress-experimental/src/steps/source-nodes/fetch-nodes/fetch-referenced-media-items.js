import chunk from "lodash/chunk"
import store from "~/store"
import atob from "atob"
import PQueue from "p-queue"
import { createRemoteMediaItemNode } from "../create-nodes/create-remote-media-item-node"
import { formatLogMessage } from "~/utils/format-log-message"
import { paginatedWpNodeFetch } from "./fetch-nodes-paginated"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"

const metaConcurrency = 5

const mediaFileQueue = new PQueue({
  concurrency: Number(process.env.GATSBY_CONCURRENT_DOWNLOAD) - metaConcurrency,
})

const mediaMetaQueue = new PQueue({
  concurrency: metaConcurrency,
  carryoverConcurrencyCount: true,
})

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

  let allMediaItemNodes = []
  const retriedFiles = {}

  for (const relayIds of chunkedIds) {
    mediaMetaQueue.add(async () => {
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
        helpers,
        settings,
        in: ids,
      })

      const pushNodeOntoQueue = node => {
        allMediaItemNodes.push(node)

        mediaFileQueue.add(async () => {
          let remoteFile

          const timesRetried = retriedFiles[node.id] || 0

          try {
            remoteFile = await createRemoteMediaItemNode({
              mediaItemNode: node,
              helpers,
            })
            if (timesRetried > 2) {
              helpers.reporter.info(
                `Successfully downloaded ${node.mediaItemUrl}`
              )
            }
          } catch (error) {
            // Errors that should exit are handled one level down
            // in createRemoteMediaItemNode
            //
            // if we haven't reqeued this before,
            // add it to the end of the queue to
            // try once more later
            if (timesRetried < 5) {
              if (timesRetried > 2) {
                helpers.reporter.info(
                  `pushing ${node.mediaItemUrl} to the end of the request queue.`
                )

                helpers.reporter.info(
                  `Previously retried ${timesRetried} times already.`
                )
              }

              retriedFiles[node.id] = timesRetried + 1

              pushNodeOntoQueue(node)
            } else {
              helpers.reporter.info(
                `\n\nalready re-queued ${node.mediaItemUrl} 5 times :( sorry.\nTry lowering process.env.GATSBY_CONCURRENT_DOWNLOAD.\nIt's currently set to ${process.env.GATSBY_CONCURRENT_DOWNLOAD}\n\n`
              )
              // we already tried this earlier in the queue
              // no choice but to give up :(
              helpers.reporter.panic(error)
            }
          }

          if (!remoteFile) {
            return
          }

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
      }

      allNodesOfContentType.forEach(pushNodeOntoQueue)

      activity.setStatus(`fetched ${allMediaItemNodes.length}`)
    })
  }

  await mediaMetaQueue.onIdle()
  await mediaFileQueue.onIdle()

  if (!allMediaItemNodes || !allMediaItemNodes.length) {
    return
  }

  if (allMediaItemNodes.length > 2001 && !(allMediaItemNodes % 1000)) {
    reporter.info(
      formatLogMessage(`fetched ${allMediaItemNodes.length} MediaItems`)
    )
  }

  if (verbose) {
    activity.end()
  }
}
