import { CREATED_NODE_IDS, LAST_COMPLETED_SOURCE_TIME } from "~/constants"
import { fetchAndRunWpActions } from "./wp-actions"
import { formatLogMessage } from "~/utils/format-log-message"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { getPersistentCache } from "~/utils/cache"
import { needToTouchNodes } from "../../../utils/gatsby-features"
import { withPluginKey } from "~/store"

export const touchValidNodes = async () => {
  if (!needToTouchNodes) {
    return
  }

  const { helpers } = getGatsbyApi()
  const { actions } = helpers

  const validNodeIds = await getPersistentCache({ key: CREATED_NODE_IDS })

  if (validNodeIds?.length) {
    validNodeIds.forEach(nodeId => actions.touchNode(helpers.getNode(nodeId)))
  }
}

/**
 * fetchAndApplyNodeUpdates
 *
 * uses query info (types and gql query strings) fetched/generated in
 * onPreBootstrap to ask WordPress for the latest changes, and then
 * apply creates, updates, and deletes to Gatsby nodes
 */
const fetchAndApplyNodeUpdates = async ({
  since,
  throwFetchErrors = false,
  throwGqlErrors = false,
}) => {
  const { helpers, pluginOptions } = getGatsbyApi()

  const { cache, reporter } = helpers

  const activity = reporter.activityTimer(
    formatLogMessage(`pull updates since last build`)
  )
  activity.start()

  if (!since) {
    since = await cache.get(withPluginKey(LAST_COMPLETED_SOURCE_TIME))
  }

  // Check with WPGQL to create, delete, or update cached WP nodes
  const { wpActions, didUpdate } = await fetchAndRunWpActions({
    since,
    helpers,
    pluginOptions,
    throwFetchErrors,
    throwGqlErrors,
  })

  await touchValidNodes()

  activity.end()

  return { wpActions, didUpdate }
}

export default fetchAndApplyNodeUpdates
