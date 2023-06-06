import { actionMonitorQuery } from "~/utils/graphql-queries"
import wpActionDELETE from "./delete"
import wpActionUPDATE from "./update"
import { LAST_COMPLETED_SOURCE_TIME } from "~/constants"
import { paginatedWpNodeFetch } from "~/steps/source-nodes/fetch-nodes/fetch-nodes-paginated"

import fetchAndCreateNonNodeRootFields from "~/steps/source-nodes/create-nodes/fetch-and-create-non-node-root-fields"
import { setHardCachedNodes } from "~/utils/cache"
import { sourceNodes } from "~/steps/source-nodes"
import { withPluginKey } from "~/store"

/**
 * getWpActions
 *
 * pull the latest changes from WP and determine which of those changes
 * require updates in Gatsby, then return valid changes
 * An example of a non-valid change would be a post that was created
 * and then immediately deleted.
 */
export const getWpActions = async ({
  variables,
  helpers,
  throwFetchErrors = false,
  throwGqlErrors = false,
}) => {
  const sourceTime = Date.now()

  // @todo add pagination in case there are more than 100 actions since the last build
  const actionMonitorActions = await paginatedWpNodeFetch({
    contentTypePlural: `actionMonitorActions`,
    query: actionMonitorQuery,
    nodeTypeName: `ActionMonitor`,
    helpers,
    throwFetchErrors,
    throwGqlErrors,
    ...variables,
  })

  if (!actionMonitorActions || !actionMonitorActions.length) {
    return []
  }

  await helpers.cache.set(withPluginKey(LAST_COMPLETED_SOURCE_TIME), sourceTime)

  return actionMonitorActions
}

/**
 * Acts on changes in WordPress to call functions that sync Gatsby with
 * the latest WP changes
 */
export const handleWpActions = async api => {
  const { cachedNodeIds, helpers } = api

  switch (api.wpAction.actionType) {
    case `DELETE`:
      await wpActionDELETE(api)
      break
    case `UPDATE`:
    case `CREATE`:
      await wpActionUPDATE(api)
      break
    case `NON_NODE_ROOT_FIELDS`:
      await fetchAndCreateNonNodeRootFields()
      break
    case `REFETCH_ALL`:
      await sourceNodes({ ...helpers, refetchAll: true }, {})
  }

  await setHardCachedNodes({ helpers })

  return cachedNodeIds
}

/**
 * fetchAndRunWpActions
 *
 * fetches a list of latest changes in WordPress
 * and then acts on those changes
 */
export const fetchAndRunWpActions = async ({
  helpers,
  pluginOptions,
  since,
  throwFetchErrors = false,
  throwGqlErrors = false,
}) => {
  // check for new, edited, or deleted posts in WP "Action Monitor"
  const wpActions = await getWpActions({
    variables: {
      since,
    },
    helpers,
    throwFetchErrors,
    throwGqlErrors,
  })

  const didUpdate = !!wpActions.length

  if (didUpdate) {
    for (const wpAction of wpActions) {
      // Create, update, and delete nodes
      await handleWpActions({
        helpers,
        pluginOptions,
        wpAction,
      })
    }
  }

  return {
    wpActions,
    didUpdate,
  }
}
