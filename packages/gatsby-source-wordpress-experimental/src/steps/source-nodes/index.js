import fetchAndApplyNodeUpdates, {
  touchValidNodes,
} from "./update-nodes/fetch-node-updates"

import { fetchAndCreateAllNodes } from "./fetch-nodes/fetch-nodes"

import { LAST_COMPLETED_SOURCE_TIME } from "~/constants"
import store from "~/store"
import fetchAndCreateNonNodeRootFields from "./create-nodes/fetch-and-create-non-node-root-fields"

const sourceNodes = async (helpers, _pluginOptions) => {
  const {
    cache,
    webhookBody: { preview },
  } = helpers

  if (preview) {
    await touchValidNodes()

    return
  }

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  const { schemaWasChanged } = store.getState().remoteSchema

  const fetchEverything = !lastCompletedSourceTime || schemaWasChanged

  // If this is an uncached build,
  // or our initial build to fetch and cache everything didn't complete,
  // pull everything from WPGQL
  if (fetchEverything) {
    await fetchAndCreateAllNodes()

    await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
  }

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  else if (!fetchEverything) {
    await fetchAndApplyNodeUpdates({
      since: lastCompletedSourceTime,
    })
  }

  // fetch non-node root fields such as settings.
  // For now, we're refetching them on every build
  await fetchAndCreateNonNodeRootFields()
}

export { sourceNodes }
