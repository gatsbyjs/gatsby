import chalk from "chalk"

import { formatLogMessage } from "~/utils/format-log-message"
import store from "~/store"
import {
  getTypeSettingsByType,
  buildTypeName,
} from "~/steps/create-schema-customization/helpers"
import { fetchGraphql } from "~/utils/fetch-graphql"
import { getQueryInfoBySingleFieldName } from "../../helpers"
import { CREATED_NODE_IDS } from "~/constants"

const wpActionDELETE = async ({
  helpers,
  // cachedNodeIds,
  wpAction,
}) => {
  const { reporter, actions, getNode, cache } = helpers

  let cachedNodeIds = await cache.get(CREATED_NODE_IDS)

  // get the node ID from the WPGQL id
  const nodeId = wpAction.referencedNodeGlobalRelayID

  const node = await getNode(nodeId)

  const { typeInfo } = getQueryInfoBySingleFieldName(
    wpAction.referencedNodeSingularName
  )

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  if (
    typeSettings.beforeChangeNode &&
    typeof typeSettings.beforeChangeNode === `function`
  ) {
    const additionalNodeIds = await typeSettings.beforeChangeNode({
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

  if (node) {
    await actions.deleteNode({ node })

    reporter.log(``)
    reporter.info(
      formatLogMessage(
        `${chalk.bold(`deleted  ${wpAction.referencedNodeSingularName}`)} #${
          wpAction.referencedNodeID
        }`
      )
    )

    reporter.log(``)
  }

  // Remove this from cached node id's so we don't try to touch it
  const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

  await cache.set(CREATED_NODE_IDS, validNodeIds)

  // return validNodeIds
}

module.exports = wpActionDELETE
