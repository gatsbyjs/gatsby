import fetchAndApplyNodeUpdates from "./fetch-node-updates"
import { fetchAndCreateAllNodes } from "./fetch-nodes"

import { LAST_COMPLETED_SOURCE_TIME } from "~/constants"
import { createContentTypeNodes } from "~/steps/get-content-types"
import store from "~/store"
import fetchAndCreateNonNodeRootFields from "./fetch-and-create-non-node-root-fields"

const sourceNodes = async helpers => {
  const { cache } = helpers

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  const { schemaWasChanged } = store.getState().remoteSchema

  const fetchEverything = !lastCompletedSourceTime || schemaWasChanged

  // If this is an uncached build,
  // or our initial build to fetch and cache everything didn't complete,
  // pull everything from WPGQL
  if (fetchEverything) {
    await fetchAndCreateAllNodes()
  }

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  if (!fetchEverything) {
    await fetchAndApplyNodeUpdates({
      since: lastCompletedSourceTime,
    })
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())

  // fetch non-node root fields such as settings.
  // For now, we're refetching them on every build
  await fetchAndCreateNonNodeRootFields()
}

export { sourceNodes, createContentTypeNodes }
