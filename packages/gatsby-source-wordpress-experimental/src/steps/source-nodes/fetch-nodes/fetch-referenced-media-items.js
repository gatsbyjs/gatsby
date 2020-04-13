import chunk from "lodash/chunk"
import store from "~/store"
import atob from "atob"
import PQueue from "p-queue"
import { createRemoteMediaItemNode } from "../create-nodes/create-remote-media-item-node"
import { formatLogMessage } from "~/utils/format-log-message"
import { paginatedWpNodeFetch } from "./fetch-nodes-paginated"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"

const nodeFetchConcurrency = 2

const mediaFileFetchQueue = new PQueue({
  concurrency:
    Number(process.env.GATSBY_CONCURRENT_DOWNLOAD ?? 200) -
    nodeFetchConcurrency,
  carryoverConcurrencyCount: true,
})

const mediaNodeFetchQueue = new PQueue({
  concurrency: nodeFetchConcurrency,
  carryoverConcurrencyCount: true,
})

const previouslyRetriedPromises = {}

const pushPromiseOntoRetryQueue = ({
  node,
  helpers,
  createContentDigest,
  actions,
  queue,
  retryKey,
  retryPromise,
}) => {
  queue.add(async () => {
    const timesRetried = previouslyRetriedPromises[retryKey] || 0

    if (timesRetried >= 2) {
      // if we've retried this more than once, pause for a sec.
      await new Promise(resolve =>
        setTimeout(() => resolve(), timesRetried * 500)
      )
    }

    try {
      await retryPromise({
        createContentDigest,
        actions,
        helpers,
        node,
        queue,
        retryKey,
        retryPromise,
        timesRetried,
      })
    } catch (error) {
      // Errors that should exit are handled one level down
      // in createRemoteMediaItemNode
      //
      // if we haven't reqeued this before,
      // add it to the end of the queue to
      // try once more later
      if (timesRetried < 5) {
        if (timesRetried > 1) {
          helpers.reporter.info(
            `pushing ${retryKey} to the end of the request queue.`
          )

          helpers.reporter.info(
            `Previously retried ${timesRetried} times already.`
          )
        }

        previouslyRetriedPromises[retryKey] = timesRetried + 1

        pushPromiseOntoRetryQueue({
          node,
          helpers,
          createContentDigest,
          actions,
          queue,
          retryKey,
          retryPromise,
        })
      } else {
        helpers.reporter.info(
          `\n\nalready re-queued ${retryKey} 5 times :( sorry.\nTry lowering process.env.GATSBY_CONCURRENT_DOWNLOAD.\nIt's currently set to ${process.env.GATSBY_CONCURRENT_DOWNLOAD}\n\n`
        )
        // we already tried this earlier in the queue
        // no choice but to give up :(
        helpers.reporter.panic(error)
      }
    }
  })
}

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

  for (const [index, relayIds] of chunkedIds.entries()) {
    pushPromiseOntoRetryQueue({
      helpers,
      createContentDigest,
      actions,
      queue: mediaNodeFetchQueue,
      retryKey: `Media Item query #${index}`,
      retryPromise: async () => {
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
          // this allows us to retry-on-end-of-queue
          throwFetchErrors: true,
        })

        allNodesOfContentType.forEach(node => {
          allMediaItemNodes.push(node)

          pushPromiseOntoRetryQueue({
            node,
            helpers,
            createContentDigest,
            actions,
            queue: mediaFileFetchQueue,
            retryKey: node.mediaItemUrl,
            retryPromise: async ({
              createContentDigest,
              actions,
              helpers,
              node,
              retryKey,
              timesRetried,
            }) => {
              let remoteFile = await createRemoteMediaItemNode({
                mediaItemNode: node,
                fixedBarTotal: referencedMediaItemNodeIds.length,
                helpers,
              })

              if (timesRetried > 1) {
                helpers.reporter.info(
                  `Successfully fetched ${retryKey} after retrying ${timesRetried} times`
                )
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
            },
          })
        })

        activity.setStatus(`fetched ${allMediaItemNodes.length}`)
      },
    })
  }

  await mediaNodeFetchQueue.onIdle()
  await mediaFileFetchQueue.onIdle()

  if (!allMediaItemNodes || !allMediaItemNodes.length) {
    return
  }

  if (verbose) {
    activity.end()
  }
}
