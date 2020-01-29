import { formatLogMessage } from "~/utils/format-log-message"
import store from "~/store"
import {
  getTypeSettingsByType,
  buildTypeName,
} from "~/steps/create-schema-customization/helpers"
import { fetchGraphql } from "~/utils/fetch-graphql"
import { getQueryInfoByTypeName } from "../../helpers"

const wpActionDELETE = async ({ helpers, cachedNodeIds, wpAction }) => {
  const { reporter, actions, getNode } = helpers

  // get the node ID from the WPGQL id
  const nodeId = wpAction.referencedNodeGlobalRelayID

  const { verbose } = store.getState().gatsbyApi.pluginOptions

  reporter.log(``)
  reporter.info(
    formatLogMessage(
      `deleted ${wpAction.referencedNodeSingularName}${
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

  reporter.log(``)

  const node = await getNode(nodeId)

  if (node) {
    await actions.deleteNode({ node })
  }

  const { typeInfo } = getQueryInfoByTypeName(
    wpAction.referencedNodeSingularName
  )

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  if (
    typeSettings.afterRemoteNodeProcessed &&
    typeof typeSettings.afterRemoteNodeProcessed === `function`
  ) {
    const additionalNodeIds = await typeSettings.afterRemoteNodeProcessed({
      actionType: `DELETE`,
      remoteNode: node,
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

  // Remove this from cached node id's so we don't try to touch it
  const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

  return validNodeIds
}

module.exports = wpActionDELETE
