import fetchGraphql from "../../../utils/fetch-graphql"
import { getPageQuery } from "../graphql-queries"

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  intervalRefetching,
  cachedNodeIds,
  pluginOptions,
}) => {
  const { createNodeId } = helpers
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  if (wpAction.referencedPostStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  // otherwise we need to refetch the post
  const { url } = pluginOptions
  const query = getPageQuery(wpAction.referencedPostSingleName)
  const { data } = await fetchGraphql({
    url,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

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
    ...data.wpContent,
    id: nodeId,
    parent: null,
    internal: {
      contentDigest: createContentDigest(node),
      type: `WpContent`,
    },
  })

  if (intervalRefetching) {
    helpers.reporter.info(
      `[gatsby-source-wordpress] updated ${wpAction.referencedPostSingleName} ${wpAction.referencedPostID}`
    )
  }

  // we can leave cachedNodeIds as-is since the ID of the edited
  // node will be the same
  return cachedNodeIds
}

export default wpActionUPDATE
