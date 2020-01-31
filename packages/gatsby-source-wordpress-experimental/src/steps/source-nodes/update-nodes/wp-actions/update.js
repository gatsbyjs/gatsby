import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"
import chalk from "chalk"
import { getQueryInfoBySingleFieldName } from "../../helpers"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { CREATED_NODE_IDS } from "~/constants"
import {
  buildTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"

export const fetchAndCreateSingleNode = async ({
  singleName,
  id,
  actionType,
  cachedNodeIds,
}) => {
  const { nodeQuery: query } = getQueryInfoBySingleFieldName(singleName) || {}

  if (!query) {
    const {
      helpers: { reporter },
    } = getGatsbyApi()

    reporter.log(``)
    reporter.warn(
      formatLogMessage(
        `A ${singleName} was updated, but no query was found for this node type.`
      )
    )
    reporter.log(``)

    return { node: null }
  }

  const { data } = await fetchGraphql({
    query,
    variables: {
      id,
    },
  })

  // if we ask for a node that doesn't exist
  if (!data || (data && data[singleName] === null)) {
    return { node: null }
  }

  let createdNode

  // returns an object { node, additionalNodeIds }
  createdNode = await createSingleNode({
    singleName,
    id,
    actionType,
    data,
    cachedNodeIds,
  })

  return createdNode || null
}

export const createSingleNode = async ({
  singleName,
  id,
  actionType,
  data,
  cachedNodeIds,
}) => {
  const { helpers } = getGatsbyApi()
  const { typeInfo } = getQueryInfoBySingleFieldName(singleName)

  if (!cachedNodeIds) {
    cachedNodeIds = await helpers.cache.get(CREATED_NODE_IDS)
  }

  const updatedNodeContent = {
    ...data[singleName],
    nodeType: typeInfo.nodesTypeName,
    type: typeInfo.nodesTypeName,
  }

  const { actions } = helpers

  const { createContentDigest } = helpers

  const remoteNode = {
    ...updatedNodeContent,
    id: id,
    parent: null,
    internal: {
      contentDigest: createContentDigest(updatedNodeContent),
      type: buildTypeName(typeInfo.nodesTypeName),
    },
  }

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  let additionalNodeIds

  if (
    typeSettings.beforeChangeNode &&
    typeof typeSettings.beforeChangeNode === `function`
  ) {
    additionalNodeIds = await typeSettings.beforeChangeNode({
      actionType: actionType,
      remoteNode,
      actions,
      helpers,
      typeInfo,
      fetchGraphql,
      typeSettings,
      buildTypeName,
      wpStore: store,
    })
  }

  await actions.createNode(remoteNode)

  cachedNodeIds.push(remoteNode.id)

  if (additionalNodeIds && additionalNodeIds.length) {
    additionalNodeIds.forEach(id => cachedNodeIds.push(id))
  }

  await helpers.cache.set(CREATED_NODE_IDS, cachedNodeIds)

  return { additionalNodeIds, node: remoteNode }
}

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  // intervalRefetching,
}) => {
  const { reporter, cache } = helpers

  let cachedNodeIds = await cache.get(CREATED_NODE_IDS)

  const state = store.getState()
  const {
    gatsbyApi: {
      pluginOptions: { verbose },
      helpers: { getNode },
    },
  } = state

  const nodeId = wpAction.referencedNodeGlobalRelayID

  if (wpAction.referencedNodeStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

    await cache.set(CREATED_NODE_IDS, validNodeIds)

    return
  }

  const existingNode = await getNode(nodeId)

  const { node } = await fetchAndCreateSingleNode({
    id: nodeId,
    actionType: wpAction.actionType,
    singleName: wpAction.referencedNodeSingularName,
    cachedNodeIds,
  })

  if (node) {
    reporter.log(``)
    reporter.info(
      formatLogMessage(
        `${chalk.bold(
          `${wpAction.actionType.toLowerCase()} ${
            wpAction.referencedNodeSingularName
          }`
        )} ${wpAction.title} (#${wpAction.referencedNodeID})`
      )
    )
    reporter.log(``)

    if (verbose) {
      const nodeEntries = existingNode ? Object.entries(existingNode) : null

      if (nodeEntries && nodeEntries.length) {
        nodeEntries
          .filter(([key]) => !key.includes(`modifiedGmt`) && key !== `modified`)
          .forEach(([key, value]) => {
            if (!node || !node[key]) {
              return
            }

            if (
              // if the value of this field changed, log it
              typeof node[key] === `string` &&
              value !== node[key]
            ) {
              reporter.log(``)
              reporter.info(chalk.bold(`${key} changed`))
              reporter.log(``)
              reporter.log(`${chalk.italic.bold(`    from`)}`)
              reporter.log(`      ${value}`)
              reporter.log(chalk.italic.bold(`    to`))
              reporter.log(`      ${node[key]}`)
              reporter.log(``)
            }
          })

        reporter.log(``)
      }
    }
  }

  // return cachedNodeIds
}

export default wpActionUPDATE
