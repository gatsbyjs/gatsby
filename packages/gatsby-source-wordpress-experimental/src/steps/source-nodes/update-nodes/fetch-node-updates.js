import { CREATED_NODE_IDS } from "~/constants"
import { fetchAndRunWpActions } from "./wp-actions"
import { formatLogMessage } from "~/utils/format-log-message"
import { getGatsbyApi } from "~/utils/get-gatsby-api"

/**
 * fetchAndApplyNodeUpdates
 *
 * uses query info (types and gql query strings) fetched/generated in
 * onPreBootstrap to ask WordPress for the latest changes, and then
 * apply creates, updates, and deletes to Gatsby nodes
 */
const fetchAndApplyNodeUpdates = async ({ since, intervalRefetching }) => {
  const { helpers, pluginOptions } = getGatsbyApi()

  const { cache, reporter } = helpers

  let activity

  if (!intervalRefetching) {
    activity = reporter.activityTimer(
      formatLogMessage(`pull updates since last build`)
    )
    activity.start()
  }

  // Check with WPGQL to create, delete, or update cached WP nodes
  const { wpActions, didUpdate } = await fetchAndRunWpActions({
    since,
    intervalRefetching,
    helpers,
    pluginOptions,
  })

  const { actions } = helpers

  if (
    // if we're refetching, we only want to touch all nodes
    // if something changed
    didUpdate ||
    // if this is a regular build, we want to touch all nodes
    // so they don't get garbage collected
    !intervalRefetching
  ) {
    let validNodeIds = await cache.get(CREATED_NODE_IDS)
    validNodeIds.forEach(nodeId => actions.touchNode({ nodeId }))
  }

  if (!intervalRefetching) {
    activity.end()
  }

  return { wpActions, didUpdate }
}

export default fetchAndApplyNodeUpdates
