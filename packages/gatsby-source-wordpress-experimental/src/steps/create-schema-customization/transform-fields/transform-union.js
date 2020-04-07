import { buildTypeName } from "~/steps/create-schema-customization/helpers"

export const transformUnion = ({ field, fieldName }) => ({
  type: buildTypeName(field.type.name),
  resolve: (source, _, context) => {
    const resolvedField =
      source[fieldName] || source[`${field.name}__typename_${field.type.name}`]

    if (resolvedField && resolvedField.id) {
      const gatsbyNode = context.nodeModel.getNodeById({
        id: resolvedField.id,
        type: resolvedField.type,
      })

      if (gatsbyNode) {
        return gatsbyNode
      }
    }

    return resolvedField
  },
})

export const transformListOfUnions = ({ field, fieldName }) => {
  const typeName = buildTypeName(field.type.ofType.name)

  return {
    type: `[${typeName}]`,
    resolve: (source, _, context) => {
      const field =
        source[fieldName] ||
        source[`${field.name}__typename_${field.type.name}`]

      if ((!field && field !== false) || !field.length) {
        return null
      }

      return field.map(item => {
        // @todo use our list of Gatsby node types to do a more performant check
        // on wether this is a Gatsby node or not.
        const node = context.nodeModel.getNodeById({
          id: item.id,
          type: buildTypeName(item.__typename),
        })

        if (node) {
          return node
        }

        return item
      })
    },
  }
}
