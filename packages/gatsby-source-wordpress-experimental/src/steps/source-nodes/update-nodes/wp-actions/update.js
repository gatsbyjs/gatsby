import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"
import chalk from "chalk"
import { getQueryInfoByTypeName } from "../../helpers"
import {
  buildTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  intervalRefetching,
  cachedNodeIds,
}) => {
  const { reporter } = helpers

  const state = store.getState()
  const {
    gatsbyApi: {
      pluginOptions: { verbose },
    },
  } = state

  const nodeId = wpAction.referencedNodeGlobalRelayID

  if (wpAction.referencedNodeStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  const { nodeQuery: query, typeInfo } = getQueryInfoByTypeName(
    wpAction.referencedNodeSingularName
  )

  const { data } = await fetchGraphql({
    query,
    variables: {
      id: wpAction.referencedNodeGlobalRelayID,
    },
  })

  const updatedNodeContent = {
    ...data[wpAction.referencedNodeSingularName],
    nodeType: typeInfo.nodesTypeName,
    type: typeInfo.nodesTypeName,
  }

  const { actions, getNode } = helpers
  const node = await getNode(nodeId)

  const { createContentDigest } = helpers

  const remoteNode = {
    ...updatedNodeContent,
    id: nodeId,
    parent: null,
    internal: {
      contentDigest: createContentDigest(updatedNodeContent),
      type: buildTypeName(typeInfo.nodesTypeName),
    },
  }

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  if (
    typeSettings.afterRemoteNodeProcessed &&
    typeof typeSettings.afterRemoteNodeProcessed === `function`
  ) {
    const additionalNodeIds = await typeSettings.afterRemoteNodeProcessed({
      actionType: wpAction.actionType,
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

  await actions.createNode(remoteNode)

  if (intervalRefetching) {
    reporter.log(``)
    reporter.info(
      formatLogMessage(
        `${chalk.bold(`updated ${wpAction.referencedNodeSingularName}`)} #${
          wpAction.referencedNodeID
        }`
      )
    )

    if (verbose) {
      const nodeEntries = node ? Object.entries(node) : null

      if (nodeEntries && nodeEntries.length) {
        nodeEntries
          .filter(([key]) => !key.includes(`modifiedGmt`) && key !== `modified`)
          .forEach(([key, value]) => {
            if (
              // if the value of this field changed, log it
              typeof updatedNodeContent[key] === `string` &&
              value !== updatedNodeContent[key]
            ) {
              reporter.log(``)
              reporter.info(chalk.bold(`${key} changed`))
              reporter.log(``)
              reporter.log(`${chalk.italic.bold(`    from`)}`)
              reporter.log(`      ${value}`)
              reporter.log(chalk.italic.bold(`    to`))
              reporter.log(`      ${updatedNodeContent[key]}`)
              reporter.log(``)
            }
          })

        reporter.log(``)
      }
    }
  }

  // we can leave cachedNodeIds as-is since the ID of the edited
  // node will be the same
  return cachedNodeIds
}

export default wpActionUPDATE
