import fetchAndApplyNodeUpdates from "./fetch-node-updates"
import { fetchAndCreateAllNodes } from "./fetch-nodes"

import { LAST_COMPLETED_SOURCE_TIME } from "../constants"
import { createContentTypeNodes } from "./get-content-types"
import store from "../../store"

const sourceNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  // this is temporary until WPGQL can give us a node list of post types
  // see https://github.com/wp-graphql/wp-graphql/issues/1045
  await createContentTypeNodes()

  const { cache } = helpers

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  const { schemaHasChanged } = store.getState().introspection

  const fetchEverything = !lastCompletedSourceTime || schemaHasChanged
  const fetchUpdates = !fetchEverything

  // If this is an uncached build,
  // or our initial build to fetch and cache everything didn't complete,
  // pull everything from WPGQL
  if (fetchEverything) {
    await fetchAndCreateAllNodes(...api)
  }

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  if (fetchUpdates) {
    await fetchAndApplyNodeUpdates(
      {
        since: lastCompletedSourceTime,
      },
      ...api
    )
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
}

export default sourceNodes
