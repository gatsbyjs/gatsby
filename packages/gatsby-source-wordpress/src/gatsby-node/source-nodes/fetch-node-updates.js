import { CREATED_NODE_IDS } from "../constants"
import { fetchAndRunWpActions } from "./wp-actions"

const fetchAndApplyNodeUpdates = async (
  { since, intervalRefetching },
  helpers,
  pluginOptions
) => {
  const { cache, reporter } = helpers
  let cachedNodeIds = await cache.get(CREATED_NODE_IDS)

  let activity

  if (!intervalRefetching) {
    activity = reporter.activityTimer(
      `[gatsby-source-wordpress] pull updates since last build`
    )
    activity.start()
  }

  // Check with WPGQL to create, delete, or update cached WP nodes
  const { validNodeIds, wpActions, didUpdate } = await fetchAndRunWpActions({
    since,
    intervalRefetching,
    cachedNodeIds,
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
    validNodeIds.forEach(nodeId => actions.touchNode({ nodeId }))

    // update cachedNodeIds
    await cache.set(CREATED_NODE_IDS, validNodeIds)
  }

  if (!intervalRefetching) {
    activity.end()
  }

  return { validNodeIds, wpActions, didUpdate }
}

export default fetchAndApplyNodeUpdates
