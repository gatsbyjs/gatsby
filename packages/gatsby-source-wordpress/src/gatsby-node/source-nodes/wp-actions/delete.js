const wpActionDELETE = async ({ helpers, cachedNodeIds, wpAction }) => {
  const { reporter, actions, getNode } = helpers

  // get the node ID from the WPGQL id
  const nodeId = wpAction.referencedPostGlobalRelayID

  reporter.info(
    `[gatsby-source-wordpress] deleted ${wpAction.referencedPostSingleName} ${wpAction.referencedPostID}`
  )

  const node = await getNode(nodeId)

  if (node) {
    // @todo figure out why touching nodes before deleting was necessary
    await actions.touchNode({ nodeId })
    await actions.deleteNode({ node })
  }

  // Remove this from cached node id's so we don't try to touch it
  const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

  return validNodeIds
}

module.exports = wpActionDELETE
