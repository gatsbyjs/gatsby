import fetchGraphql from "~/utils/fetch-graphql"
import { actionMonitorQuery } from "~/utils/graphql-queries"
import wpActionCREATE from "./create"
import wpActionDELETE from "./delete"
import wpActionUPDATE from "./update"

/**
 * getWpActions
 *
 * pull the latest changes from WP and determine which of those changes
 * require updates in Gatsby, then return valid changes
 * An example of a non-valid change would be a post that was created
 * and then immediately deleted.
 */
export const getWpActions = async (__, { url }, variables) => {
  const { data } = await fetchGraphql({
    query: actionMonitorQuery,
    variables,
  })

  // we only want to use the latest action on each post ID in case multiple
  // actions were recorded for the same post
  // for example: if a post was deleted and then immediately published again.
  // if we kept both actions we would download the node and then delete it
  // Since we receive the actions in order from newest to oldest, we
  // can prefer actions at the top of the list.
  const actionabledIds = []
  const actions = data.actionMonitorActions.nodes.filter(action => {
    const id = action.referencedNodeGlobalRelayID

    // check if an action with the same id exists
    const actionExists = actionabledIds.find(
      actionableId => actionableId === id
    )

    // if there isn't one, record the id of this one to filter
    // out further actions with the same id
    if (!actionExists) {
      actionabledIds.push(id)
    }

    // just keep the action if one doesn't already exist
    return !actionExists
  })

  return actions
}

/**
 * Acts on changes in WordPress to call functions that sync Gatsby with
 * the latest WP changes
 */
export const handleWpActions = async api => {
  let { cachedNodeIds } = api

  switch (api.wpAction.actionType) {
    // @todo case `PREVIEW`: <- link a revision to it's parent post
    case `DELETE`:
      cachedNodeIds = await wpActionDELETE(api)
      break
    case `UPDATE`:
      cachedNodeIds = await wpActionUPDATE(api)
      break
    case `CREATE`:
      cachedNodeIds = await wpActionCREATE(api)
  }

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
  intervalRefetching,
  since,
  cachedNodeIds,
}) => {
  // check for new, edited, or deleted posts in WP "Action Monitor"
  const wpActions = await getWpActions(helpers, pluginOptions, {
    since,
  })

  const didUpdate = !!wpActions.length

  if (didUpdate) {
    for (const wpAction of wpActions) {
      // Create, update, and delete nodes
      cachedNodeIds = await handleWpActions({
        helpers,
        pluginOptions,
        intervalRefetching,
        wpAction,
        cachedNodeIds,
      })
    }
  }

  return {
    wpActions,
    didUpdate,
    validNodeIds: cachedNodeIds,
  }
}
