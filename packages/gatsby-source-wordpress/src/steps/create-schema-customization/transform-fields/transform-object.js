import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"
import { getQueryInfoByTypeName } from "~/steps/source-nodes/helpers"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { inPreviewMode } from "~/steps/preview/index"
import { usingGatsbyV4OrGreater } from "~/utils/gatsby-version"
import { findNamedTypeName, introspectionFieldTypeToSDL } from "../helpers"

export const transformListOfGatsbyNodes = ({
  field,
  fieldName,
  pluginOptions,
}) => {
  const prefix = pluginOptions.schema.typePrefix
  const typeSDLString = introspectionFieldTypeToSDL(field.type)
  const typeName = buildTypeName(findNamedTypeName(field.type), prefix)

  return {
    type: typeSDLString,
    resolve: (source, _args, context) => {
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

export const buildGatsbyNodeObjectResolver =
  ({ field, fieldName, pluginOptions }) =>
  async (source, _args, context) => {
    const prefix = pluginOptions.schema.typePrefix
    const typeName = buildTypeName(field.type.name, prefix)
    const nodeField = source[fieldName]

    if (!nodeField || (nodeField && !nodeField.id)) {
      return null
    }

    const existingNode = context.nodeModel.getNodeById({
      id: nodeField.id,
      type: typeName,
    })

    if (
      existingNode?.__typename &&
      !existingNode.__typename.startsWith(prefix)
    ) {
      existingNode.__typename = buildTypeName(existingNode.__typename, prefix)
    }

    if (existingNode) {
      return existingNode
    }

    const queryInfo = getQueryInfoByTypeName(field.type.name)

    if (!queryInfo) {
      // if we don't have query info for a type
      // it probably means this type is excluded in plugin options
      return null
    }

    const isLazyMediaItem =
      queryInfo.typeInfo.nodesTypeName === `MediaItem` &&
      queryInfo.settings.lazyNodes

    if (
      // only fetch/create nodes in resolvers for media items when they have lazyNodes enabled
      (!isLazyMediaItem &&
        // but if we're in preview mode we want to lazy fetch nodes
        // because if nodes are limited we still want to lazy fetch connections
        !inPreviewMode()) ||
      // lazyNodes option isn't supported in Gatsby v4+
      usingGatsbyV4OrGreater
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
  const { field, pluginOptions } = transformerApi
  const typeName = buildTypeName(
    field.type.name,
    pluginOptions.schema.typePrefix
  )

  return {
    type: typeName,
    resolve: buildGatsbyNodeObjectResolver(transformerApi),
  }
}
