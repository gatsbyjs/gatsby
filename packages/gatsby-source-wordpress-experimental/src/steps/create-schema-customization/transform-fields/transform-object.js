import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"
import { getQueryInfoByTypeName } from "~/steps/source-nodes/helpers"
import { getGatsbyApi } from "~/utils/get-gatsby-api"

export const transformListOfGatsbyNodes = ({ field }) => {
  const typeName = buildTypeName(field.type.ofType.name)

  return {
    type: `[${typeName}]`,
    resolve: (source, _, context) => {
      if (!source || !source.nodes || !source.nodes.length) {
        return null
      }

      return context.nodeModel.getNodesByIds({
        ids: source.nodes.map(node => node.id),
        type: typeName,
      })
    },
  }
}

export const transformGatsbyNodeObject = ({ field, fieldName }) => {
  const typeName = buildTypeName(field.type.name)

  return {
    type: typeName,
    resolve: async (source, _, context) => {
      const nodeField = source[fieldName]

      if (!nodeField || (nodeField && !nodeField.id)) {
        return null
      }

      const existingNode = context.nodeModel.getNodeById({
        id: nodeField.id,
        type: typeName,
      })

      if (existingNode) {
        return existingNode
      }

      const queryInfo = getQueryInfoByTypeName(field.type.name)

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
    },
  }
}
