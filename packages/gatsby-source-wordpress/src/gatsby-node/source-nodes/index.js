import checkPluginRequirements from "../../utils/check-plugin-requirements"
import fetchAndApplyNodeUpdates from "./fetch-node-updates"
import startIntervalRefetcher from "./interval-refetcher"
import { fetchAndCreateAllNodes } from "./fetch-nodes"

import { LAST_COMPLETED_SOURCE_TIME } from "../constants"

const sourceNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  // this potentially exits the node process
  await checkPluginRequirements(...api)

  const { cache } = helpers

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  // If this is an uncached build,
  // or our initial build to fetch and cache everything didn't complete,
  // pull everything from WPGQL
  if (!lastCompletedSourceTime) {
    await fetchAndCreateAllNodes({}, ...api)
  }

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  if (lastCompletedSourceTime) {
    await fetchAndApplyNodeUpdates(
      {
        since: lastCompletedSourceTime,
      },
      ...api
    )
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())

  if (process.env.NODE_ENV !== `production`) {
    startIntervalRefetcher({}, ...api)
  }
}

export default sourceNodes
