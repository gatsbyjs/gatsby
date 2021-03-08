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
import { setPersistentCache, getPersistentCache } from "~/utils/cache"

const wpActionDELETE = async ({
  helpers,
  // cachedNodeIds,
  wpAction,
}) => {
  const { reporter, actions, getNode } = helpers

  try {
    const cachedNodeIds = await getPersistentCache({ key: CREATED_NODE_IDS })

    // get the node ID from the WPGQL id
    const nodeId = wpAction.referencedNodeGlobalRelayID

    const node = await getNode(nodeId)

    const { typeInfo } =
      getQueryInfoBySingleFieldName(wpAction.referencedNodeSingularName) || {}

    if (!typeInfo) {
      reporter.info(
        formatLogMessage(
          `A ${wpAction.referencedNodeSingularName} was deleted, but this node type is excluded in plugin options.`
        )
      )
      reporter.log(``)
      return
    }

    const typeSettings = getTypeSettingsByType({
      name: typeInfo.nodesTypeName,
    })

    if (
      typeSettings.beforeChangeNode &&
      typeof typeSettings.beforeChangeNode === `function`
    ) {
      const { additionalNodeIds } =
        (await typeSettings.beforeChangeNode({
          actionType: `DELETE`,
          remoteNode: node,
          actions,
          helpers,
          typeInfo,
          fetchGraphql,
          typeSettings,
          buildTypeName,
          wpStore: store,
        })) || {}

      if (additionalNodeIds && additionalNodeIds.length) {
        additionalNodeIds.forEach(id => cachedNodeIds.push(id))
      }
    }

    if (node) {
      await actions.touchNode({ nodeId })
      await actions.deleteNode({ node })

      reporter.log(``)
      reporter.info(
        formatLogMessage(
          `${chalk.bold(`deleted ${wpAction.referencedNodeSingularName}`)} ${
            wpAction.title
          } (#${wpAction.referencedNodeID})`
        )
      )

      reporter.log(``)
    }

    // Remove this from cached node id's so we don't try to touch it
    const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

    await setPersistentCache({ key: CREATED_NODE_IDS, value: validNodeIds })

    // return validNodeIds
  } catch (e) {
    Object.entries(wpAction).forEach(([key, value]) => {
      reporter.warn(`${key} ${JSON.stringify(value)}`)
    })
    throw Error(e)
  }
}

module.exports = wpActionDELETE
