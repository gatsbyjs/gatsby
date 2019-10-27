const wpActionDELETE = async ({ helpers, cachedNodeIds, wpAction }) => {
  const { createNodeId } = helpers

  // get the node ID from the WPGQL id
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  // Remove this from cached node id's so we don't try to touch it
  // we don't need to explicitly delete the node since it will
  // be deleted if we don't touch it
  return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
}

module.exports = wpActionDELETE
