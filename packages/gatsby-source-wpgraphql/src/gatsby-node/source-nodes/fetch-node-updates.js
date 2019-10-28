const { fetchAndRunWpActions } = require(`./wp-actions`)

const fetchNodeUpdates = async ({ since }, helpers, pluginOptions) => {
  // Check with WPGQL to create, delete, or update cached WP nodes
  cachedNodeIds = fetchAndRunWpActions({
    since: lastCompletedSourceTime,
    cachedNodeIds,
    ...api,
  })

  const { actions } = helpers

  // touch nodes that haven't been deleted
  // so that they aren't garbage collected by Gatsby
  cachedNodeIds.forEach(nodeId => actions.touchNode({ nodeId }))

  // update cachedNodeIds
  await cache.set(CREATED_NODE_IDS, cachedNodeIds)
}

module.exports = fetchNodeUpdates
