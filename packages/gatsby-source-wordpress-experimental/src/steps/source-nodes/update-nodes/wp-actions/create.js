import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { getTypeSettingsByType } from "~/steps/create-schema-customization/helpers"
import { getQueryInfoByTypeName } from "../../helpers"

const wpActionCREATE = async ({
  helpers,
  intervalRefetching,
  cachedNodeIds,
  wpAction,
}) => {
  // if this post isn't published, we don't want it.
  if (wpAction.referencedNodeStatus !== `publish`) {
    return cachedNodeIds
  }

  const { verbose } = store.getState().gatsbyApi.pluginOptions

  // otherwise we need to fetch the post
  // so get the right gql query from redux
  const { nodeQuery: query, typeInfo } = getQueryInfoByTypeName(
    wpAction.referencedNodeSingularName
  )

  // fetch the new post
  const { data } = await fetchGraphql({
    query,
    variables: {
      id: wpAction.referencedNodeGlobalRelayID,
    },
  })
  const nodeContent = data[wpAction.referencedNodeSingularName]

  // create a node from it
  const { actions, createContentDigest } = helpers
  const nodeId = wpAction.referencedNodeGlobalRelayID

  const node = {
    ...nodeContent,
    id: nodeId,
    nodeType: typeInfo.nodesTypeName,
    type: typeInfo.nodesTypeName,
  }

  const remoteNode = {
    ...node,
    parent: null,
    internal: {
      contentDigest: createContentDigest(nodeContent),
      type: buildTypeName(typeInfo.nodesTypeName),
    },
  }

  await actions.createNode(remoteNode)

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  if (
    typeSettings.afterRemoteNodeProcessed &&
    typeof typeSettings.afterRemoteNodeProcessed === `function`
  ) {
    const additionalNodeIds = await typeSettings.afterRemoteNodeProcessed({
      actionType: `CREATE`,
      remoteNode,
      actions,
      helpers,
      typeInfo,
      fetchGraphql,
      typeSettings,
      buildTypeName,
      wpStore: store,
    })

    if (additionalNodeIds && additionalNodeIds.length) {
      additionalNodeIds.forEach(id => cachedNodeIds.push(id))
    }
  }

  if (intervalRefetching) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(
        `created ${wpAction.referencedNodeSingularName}${
          verbose
            ? `

  {
    ${wpAction.referencedNodeSingularName}Id: ${wpAction.referencedNodeID},
    id: ${nodeId}
  }`
            : ` ${wpAction.referencedNodeID}`
        }`
      )
    )
    helpers.reporter.log(``)
  }

  // add our node id to the list of cached node id's
  return [nodeId, ...cachedNodeIds]
}

export default wpActionCREATE
