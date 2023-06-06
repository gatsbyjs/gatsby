import fetchGraphql from "~/utils/fetch-graphql"
import { getStore } from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"
import chalk from "chalk"
import { getQueryInfoBySingleFieldName } from "../../helpers"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { CREATED_NODE_IDS } from "~/constants"
import fetchReferencedMediaItemsAndCreateNodes, {
  addImageCDNFieldsToNode,
} from "../../fetch-nodes/fetch-referenced-media-items"

import { dump } from "dumper.js"
import { atob } from "atob"
import { camelCase } from "lodash"

import {
  buildTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"
import { processNode } from "~/steps/source-nodes/create-nodes/process-node"
import { getPersistentCache, setPersistentCache } from "~/utils/cache"
import { needToTouchNodes } from "../../../../utils/gatsby-features"

export const fetchAndCreateSingleNode = async ({
  singleName,
  id,
  actionType,
  cachedNodeIds = [],
  token = null,
  isPreview = false,
  isDraft = false,
  userDatabaseId = null,
}) => {
  function getNodeQuery() {
    const { nodeQuery, previewQuery } =
      getQueryInfoBySingleFieldName(singleName) || {}

    // if this is a preview use the preview query
    // if it's a preview but it's the initial blank node
    // then use the regular node query as the preview query wont
    // return anything
    const query = isPreview && !isDraft ? previewQuery : nodeQuery

    return query
  }

  const query = getNodeQuery()

  const {
    helpers: { reporter, getNode },
    pluginOptions,
  } = getGatsbyApi()

  if (!query) {
    reporter.info(
      formatLogMessage(
        `A ${singleName} was updated, but no query was found for this node type. This node type is either excluded in plugin options or this is a bug.`
      )
    )
    return { node: null }
  }

  const headers =
    token && userDatabaseId
      ? {
          WPGatsbyPreview: token,
          WPGatsbyPreviewUser: userDatabaseId,
        }
      : {}

  const { data } = await fetchGraphql({
    headers,
    query,
    variables: {
      id,
    },
    errorContext: `Error occurred while updating a single "${singleName}" node.`,
  })

  let remoteNode = data[singleName] || data[camelCase(singleName)]

  if (!data || !remoteNode) {
    reporter.warn(
      formatLogMessage(
        `${id} ${singleName} was updated, but no data was returned for this node.`
      )
    )

    reporter.info({
      singleName,
      id,
      actionType,
      cachedNodeIds,
      token,
      isPreview,
      userDatabaseId,
    })

    return { node: null }
  }

  remoteNode.uri = normalizeUri({
    uri: remoteNode.uri,
    singleName,
    id,
  })

  if (isPreview && `slug` in remoteNode && !remoteNode.slug) {
    // sometimes preview nodes do not have a slug - but some users will use slugs to build page urls. So we should make sure we have something for the slug.
    remoteNode.slug = id
  }

  if (isPreview) {
    const existingNode = getNode(id)

    /**
     * For Preview, revisions of a node type can have data that updates unecessarily
     * This code block fixes that. The result being that less queries
     * are invalidated in Gatsby. For example if you have a query where you're getting the latest published post using the date field, that should be static but each preview updates the date field on the node being previewed (because the revision has a new date). So if we prevent the following fields from changing, this will be less problematic.
     */
    if (existingNode) {
      remoteNode = {
        ...remoteNode,
        databaseId: existingNode.databaseId,
        date: existingNode.date,
        dateGmt: existingNode.dateGmt,
        slug: existingNode.slug,
        guid: existingNode.guid,
        id: existingNode.id,
        link: existingNode.link,
        uri: existingNode.uri,
        status: existingNode.status,
      }
    }
  }

  data[singleName] = remoteNode

  const { additionalNodeIds, node } = await createSingleNode({
    singleName,
    id,
    actionType,
    data,
    cachedNodeIds,
  })

  if (isPreview) {
    reporter.info(
      formatLogMessage(`Preview for ${singleName} ${node.id} was updated.`)
    )

    if (pluginOptions.debug.preview) {
      reporter.info(formatLogMessage(`Raw remote node data:`))
      dump(data)
    }
  }

  return { node, additionalNodeIds }
}

export const createSingleNode = async ({
  singleName,
  id,
  actionType,
  data,
  cachedNodeIds,
}) => {
  const state = getStore().getState()
  const { helpers, pluginOptions } = state.gatsbyApi
  const { wpUrl } = state.remoteSchema

  const { typeInfo } = getQueryInfoBySingleFieldName(singleName)

  if (!cachedNodeIds && needToTouchNodes) {
    cachedNodeIds = await getPersistentCache({ key: CREATED_NODE_IDS })
  }

  const updatedNodeContent = {
    ...data[singleName],
    nodeType: typeInfo.nodesTypeName,
    type: typeInfo.nodesTypeName,
  }

  const { processedNode, nodeMediaItemIdReferences } = await processNode({
    node: updatedNodeContent,
    pluginOptions,
    wpUrl,
    helpers,
  })

  await fetchReferencedMediaItemsAndCreateNodes({
    referencedMediaItemNodeIds: nodeMediaItemIdReferences,
  })

  const { actions } = helpers

  const { createContentDigest } = helpers

  const builtTypename = buildTypeName(typeInfo.nodesTypeName)

  let remoteNode = addImageCDNFieldsToNode(
    {
      ...processedNode,
      __typename: builtTypename,
      id: id,
      parent: null,
      internal: {
        contentDigest: createContentDigest(updatedNodeContent),
        type: builtTypename,
      },
    },
    pluginOptions
  )

  const typeSettings = getTypeSettingsByType({
    name: typeInfo.nodesTypeName,
  })

  let additionalNodeIds = nodeMediaItemIdReferences || []
  let cancelUpdate

  if (
    typeSettings.beforeChangeNode &&
    typeof typeSettings.beforeChangeNode === `function`
  ) {
    const {
      additionalNodeIds: receivedAdditionalNodeIds,
      remoteNode: receivedRemoteNode,
      cancelUpdate: receivedCancelUpdate,
    } = (await typeSettings.beforeChangeNode({
      actionType: actionType,
      remoteNode,
      actions,
      helpers,
      fetchGraphql,
      typeSettings,
      buildTypeName,
      type: typeInfo.nodesTypeName,
      wpStore: getStore(),
    })) || {}

    additionalNodeIds = [
      ...additionalNodeIds,
      ...(receivedAdditionalNodeIds || []),
    ]

    cancelUpdate = receivedCancelUpdate

    if (receivedRemoteNode) {
      remoteNode = receivedRemoteNode
    }
  }

  if (cancelUpdate) {
    return {
      additionalNodeIds,
      remoteNode: null,
    }
  }

  if (remoteNode) {
    actions.createNode(remoteNode)
  }

  if (remoteNode && needToTouchNodes) {
    cachedNodeIds.push(remoteNode.id)
    additionalNodeIds?.forEach(id => cachedNodeIds.push(id))

    await setPersistentCache({ key: CREATED_NODE_IDS, value: cachedNodeIds })
  }

  return { additionalNodeIds, node: remoteNode }
}

const wpActionUPDATE = async ({ helpers, wpAction }) => {
  const reportUpdate = ({ setAction } = {}) => {
    const actionType = setAction || wpAction.actionType

    reporter.log(``)
    reporter.info(
      formatLogMessage(
        `${chalk.bold(
          `${actionType.toLowerCase()} ${wpAction.referencedNodeSingularName}`
        )} ${wpAction.title} (#${wpAction.referencedNodeID})`
      )
    )
    reporter.log(``)
  }

  const { reporter, actions } = helpers

  const cachedNodeIds = await getPersistentCache({ key: CREATED_NODE_IDS })

  const state = getStore().getState()
  const {
    gatsbyApi: {
      pluginOptions: { verbose },
      helpers: { getNode },
    },
  } = state

  const nodeId = wpAction.referencedNodeGlobalRelayID

  const existingNode = await getNode(nodeId)

  if (wpAction.referencedNodeStatus !== `publish`) {
    if (needToTouchNodes) {
      // if the post status isn't publish anymore, we need to remove the node
      // by removing it from cached nodes so it's garbage collected by Gatsby
      const validNodeIds = cachedNodeIds.filter(cachedId => cachedId !== nodeId)

      await setPersistentCache({ key: CREATED_NODE_IDS, value: validNodeIds })
    }

    if (existingNode) {
      // calling touchNode here ensures owners is populated before we delete.
      // In some cases calling delete node without touching the node first throws an error. this is a bug in Gatsby that has been fixed but this code remains to be backwards compatible with earlier versions that have the bug still.
      // TODO remove in the next major version
      await actions.touchNode(existingNode)
      await actions.deleteNode(existingNode)
      reportUpdate({ setAction: `DELETE` })
    }

    return
  }

  const { node } = await fetchAndCreateSingleNode({
    id: nodeId,
    actionType: wpAction.actionType,
    singleName: wpAction.referencedNodeSingularName,
    cachedNodeIds,
  })

  if (node) {
    reportUpdate()

    if (verbose) {
      const nodeEntries = existingNode ? Object.entries(existingNode) : null

      if (nodeEntries?.length) {
        const loggableEntries = nodeEntries.filter(
          ([key]) => !key.includes(`modifiedGmt`) && key !== `modified`
        )

        for (const [key, value] of loggableEntries) {
          if (!node || !node[key] || !value) {
            return
          }

          if (
            // if the value of this field changed, log it
            typeof node[key] === `string` &&
            value !== node[key]
          ) {
            reporter.log(``)
            reporter.info(chalk.bold(`${key} changed`))

            if (value.length < 250 && node[key].length < 250) {
              reporter.log(``)
              reporter.log(`${chalk.italic.bold(`    from`)}`)
              reporter.log(`      ${value}`)
              reporter.log(chalk.italic.bold(`    to`))
              reporter.log(`      ${node[key]}`)
              reporter.log(``)
            }
          }
        }

        reporter.log(``)
      }
    }
  }

  // return cachedNodeIds
}

const getDbIdFromRelayId = relayId => atob(relayId).split(`:`).reverse()[0]

const normalizeUri = ({ uri, id, singleName }) => {
  // remove the preview query params as they're not relevant in Gatsby
  uri = uri?.replace(`preview=true`, ``)

  // if removing the preview string leaves us with either of these
  // characters at the end, trim em off!
  if (uri?.endsWith(`?`) || uri?.endsWith(`&`)) {
    uri = uri.slice(0, -1)
  }

  // if this is a draft url which could look like
  // this /?p=543534 or /?page=4324 or /?something=yep&page=543543 or /?p=4534&what=yes
  // we will create a proper path that Gatsby can handle
  // /post_graphql_name/post_db_id/
  // this same logic is on the WP side in the preview template
  // to account for this situation.
  if (uri?.startsWith(`/?`)) {
    const dbId = getDbIdFromRelayId(id)

    return `/generated-preview-path/${singleName}/${dbId}/`
  }

  return uri
}

export default wpActionUPDATE
