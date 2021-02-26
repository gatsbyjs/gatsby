import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"
import { getQueryInfoByTypeName } from "~/steps/source-nodes/helpers"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { inPreviewMode } from "~/steps/preview/index"
import { getPluginOptions } from "../../../utils/get-gatsby-api"

export const transformListOfGatsbyNodes = ({ field, fieldName }) => {
  const typeName = buildTypeName(field.type.ofType.name)

  return {
    type: `[${typeName}]`,
    resolve: (source, args, context) => {
      let nodes = null

      const field = source[fieldName]

      if (field && Array.isArray(field)) {
        nodes = field
      } else if (Array.isArray(source?.nodes)) {
        nodes = source.nodes
      }

      if (!nodes) {
        return null
      }

      return context.nodeModel.getNodesByIds({
        ids: nodes.map(node => node?.id),
        type: typeName,
      })
    },
  }
}

export const buildGatsbyNodeObjectResolver = ({ field, fieldName }) => async (
  source,
  _,
  context
) => {
  const typeName = buildTypeName(field.type.name)
  const nodeField = source[fieldName]

  if (!nodeField || (nodeField && !nodeField.id)) {
    return null
  }

  const existingNode = context.nodeModel.getNodeById({
    id: nodeField.id,
    type: typeName,
  })

  const {
    schema: { typePrefix: prefix },
  } = getPluginOptions()

  if (existingNode?.__typename && !existingNode.__typename.startsWith(prefix)) {
    existingNode.__typename = buildTypeName(existingNode.__typename)
  }

  if (existingNode) {
    return existingNode
  }

  const queryInfo = getQueryInfoByTypeName(field.type.name)

  const isLazyMediaItem =
    queryInfo.typeInfo.nodesTypeName === `MediaItem` &&
    queryInfo.settings.lazyNodes

  if (
    // only fetch/create nodes in resolvers for media items when they have lazyNodes enabled
    !isLazyMediaItem &&
    // but if we're in preview mode we want to lazy fetch nodes
    // because if nodes are limited we still want to lazy fetch connections
    !inPreviewMode()
  ) {
    return null
  }

  // if this node doesn't exist, fetch it and create a node
  const { node } = await fetchAndCreateSingleNode({
    id: nodeField.id,
    actionType: `CREATE`,
    singleName: queryInfo.typeInfo.singularName,
  })

  if (source.id && node) {
    const { helpers } = getGatsbyApi()

    await helpers.actions.createParentChildLink({
      parent: source,
      child: node,
    })
  }

  return node || null
}

export const transformGatsbyNodeObject = transformerApi => {
  const { field } = transformerApi
  const typeName = buildTypeName(field.type.name)

  return {
    type: typeName,
    resolve: buildGatsbyNodeObjectResolver(transformerApi),
  }
}
