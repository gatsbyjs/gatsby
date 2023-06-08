import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { introspectionFieldTypeToSDL } from "../helpers"

export const transformUnion = ({ field, fieldName, pluginOptions }) => {
  const prefix = pluginOptions.schema.typePrefix
  return {
    type: buildTypeName(field.type.name, prefix),
    resolve: (source, _, context) => {
      const resolvedField =
        source[fieldName] ||
        source[`${field.name}__typename_${field.type.name}`]

      if (resolvedField && resolvedField.id) {
        const gatsbyNode = context.nodeModel.getNodeById({
          id: resolvedField.id,
          type: resolvedField.type,
        })

        if (gatsbyNode) {
          return gatsbyNode
        }
      }

      return resolvedField ?? null
    },
  }
}

export const transformListOfUnions = ({ field, fieldName, pluginOptions }) => {
  const prefix = pluginOptions.schema.typePrefix
  const typeSDLString = introspectionFieldTypeToSDL(field.type)

  return {
    type: typeSDLString,
    resolve: (source, _, context) => {
      const resolvedField =
        source[fieldName] ??
        source[`${field.name}__typename_${field.type.name}`]

      if (
        (!resolvedField && resolvedField !== false) ||
        !resolvedField.length
      ) {
        return null
      }

      return resolvedField.reduce((accumulator, item) => {
        const node = item?.id
          ? context.nodeModel.getNodeById({
              id: item.id,
              type: buildTypeName(item.__typename, prefix),
            })
          : null

        if (node) {
          accumulator.push(node)
        } else if (item && !item.id) {
          accumulator.push(item)
        }

        return accumulator
      }, [])
    },
  }
}
