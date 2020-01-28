import { buildTypeName } from "~/steps/create-schema-customization/helpers"

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
    resolve: (source, _, context) => {
      const field = source[fieldName]

      if (!field || (field && !field.id)) {
        return null
      }

      // link gatsby nodes by id
      return context.nodeModel.getNodeById({
        id: field.id,
        type: typeName,
      })
    },
  }
}
