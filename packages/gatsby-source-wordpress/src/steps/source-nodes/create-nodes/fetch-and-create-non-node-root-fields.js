import { getStore } from "~/store"
import fetchGraphql from "~/utils/fetch-graphql"
import { formatLogMessage } from "~/utils/format-log-message"
import { createNodeWithSideEffects } from "./create-nodes"
import fetchReferencedMediaItemsAndCreateNodes from "../fetch-nodes/fetch-referenced-media-items"
import { CREATED_NODE_IDS } from "~/constants"
import { getPersistentCache, setPersistentCache } from "~/utils/cache"
import { needToTouchNodes } from "../../../utils/gatsby-features"

const fetchAndCreateNonNodeRootFields = async () => {
  const state = getStore().getState()

  const {
    remoteSchema: { nonNodeQuery },
    gatsbyApi: { helpers, pluginOptions },
  } = state

  const { reporter } = helpers

  const activity = reporter.activityTimer(formatLogMessage(`fetch root fields`))

  activity.start()

  const { data } = await fetchGraphql({
    query: nonNodeQuery,
    errorContext: `Error occurred while fetching non-Node root fields.`,
  })

  const createdNodeIds = []
  // const totalSideEffectNodes = []
  const referencedMediaItemNodeIds = new Set()

  const type = pluginOptions.schema.typePrefix

  const node = {
    ...data,
    id: `${pluginOptions.url}--rootfields`,
    type,
  }

  const createRootNode = createNodeWithSideEffects({
    node,
    state,
    referencedMediaItemNodeIds,
    createdNodeIds,
    type,
    // totalSideEffectNodes,
  })

  createRootNode()

  const referencedMediaItemNodeIdsArray = [...referencedMediaItemNodeIds]

  const newMediaItemIds = referencedMediaItemNodeIdsArray.filter(
    id => !helpers.getNode(id)
  )

  /**
   * if we're not lazy fetching media items, we need to fetch them
   * upfront here
   */
  if (!pluginOptions.type.MediaItem.lazyNodes && newMediaItemIds.length) {
    getStore().dispatch.logger.createActivityTimer({
      typeName: `MediaItems`,
      pluginOptions,
      reporter,
    })

    await fetchReferencedMediaItemsAndCreateNodes({
      referencedMediaItemNodeIds: newMediaItemIds,
    })

    if (needToTouchNodes) {
      const previouslyCachedNodeIds = await getPersistentCache({
        key: CREATED_NODE_IDS,
      })

      const createdNodeIds = [
        ...new Set([
          ...(previouslyCachedNodeIds || []),
          ...referencedMediaItemNodeIdsArray,
        ]),
      ]

      // save the node id's so we can touch them on the next build
      // so that we don't have to refetch all nodes
      await setPersistentCache({ key: CREATED_NODE_IDS, value: createdNodeIds })
    }

    getStore().dispatch.logger.stopActivityTimer({
      typeName: `MediaItems`,
    })
  }

  activity.end()
}

export default fetchAndCreateNonNodeRootFields
