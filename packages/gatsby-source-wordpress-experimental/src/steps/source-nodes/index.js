import fetchAndApplyNodeUpdates from "./update-nodes/fetch-node-updates"
import { fetchAndCreateAllNodes } from "./fetch-nodes/fetch-nodes"

import { LAST_COMPLETED_SOURCE_TIME } from "~/constants"
import { createContentTypeNodes } from "~/steps/get-content-types"
import store from "~/store"
import fetchAndCreateNonNodeRootFields from "./create-nodes/fetch-and-create-non-node-root-fields"
import { formatLogMessage } from "~/utils/format-log-message"

const sourceNodes = async (helpers, pluginOptions) => {
  const { cache } = helpers

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  const { schemaWasChanged } = store.getState().remoteSchema

  if (!lastCompletedSourceTime && pluginOptions.verbose) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(`No previous builds detected, fetching all data`)
    )
    helpers.reporter.log(``)
  }

  if (lastCompletedSourceTime && schemaWasChanged && pluginOptions.verbose) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(
        `Schema was changed since the last build, fetching all data`
      )
    )
    helpers.reporter.log(``)
  }

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
  if (!fetchEverything) {
    await fetchAndApplyNodeUpdates({
      since: lastCompletedSourceTime,
    })
  }

  // fetch non-node root fields such as settings.
  // For now, we're refetching them on every build
  await fetchAndCreateNonNodeRootFields()
}

export { sourceNodes, createContentTypeNodes }
