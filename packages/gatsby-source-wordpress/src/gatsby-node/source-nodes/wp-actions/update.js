import fetchGraphql from "../../../utils/fetch-graphql"
import store from "../../../store"
import formatLogMessage from "../../../utils/format-log-message"

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  intervalRefetching,
  cachedNodeIds,
  pluginOptions,
}) => {
  const nodeId = wpAction.referencedPostGlobalRelayID

  if (wpAction.referencedPostStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  const { verbose } = store.getState().gatsbyApi.pluginOptions

  const { queries } = store.getState().introspection

  const queryInfo = Object.values(queries).find(
    q => q.typeInfo.singleName === wpAction.referencedPostSingleName
  )

  const { nodeQueryString: query } = queryInfo

  // otherwise we need to refetch the post
  const { url } = pluginOptions
  const { data } = await fetchGraphql({
    url,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  const updatedNodeContent = data[wpAction.referencedPostSingleName]

  // then delete the posts node
  const { actions, getNode } = helpers
  const node = await getNode(nodeId)

  // touch the node so we own it
  await actions.touchNode({ nodeId })

  // then we can delete it
  await actions.deleteNode({ node })

  // Now recreate the deleted node but with updated data
  const { createContentDigest } = helpers
  await actions.createNode({
    ...node,
    ...updatedNodeContent,
    id: nodeId,
    parent: null,
    internal: {
      contentDigest: createContentDigest(updatedNodeContent),
      type: `Wp${queryInfo.typeInfo.nodesTypeName}`,
    },
  })

  if (intervalRefetching) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(
        `updated ${wpAction.referencedPostSingleName}${
          verbose
            ? `

  {
    ${wpAction.referencedPostSingleName}Id: ${wpAction.referencedPostID},
    id: ${nodeId}
  }`
            : ` ${wpAction.referencedPostID}`
        }`
      )
    )
    helpers.reporter.log(``)
  }

  // we can leave cachedNodeIds as-is since the ID of the edited
  // node will be the same
  return cachedNodeIds
}

export default wpActionUPDATE
