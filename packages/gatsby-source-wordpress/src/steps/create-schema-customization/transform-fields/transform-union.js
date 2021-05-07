import { buildTypeName } from "~/steps/create-schema-customization/helpers"

export const transformUnion = ({ field, fieldName }) => {
  return {
    type: buildTypeName(field.type.name),
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

export const transformListOfUnions = ({ field, fieldName }) => {
  const typeName = buildTypeName(field.type.ofType.name)

  return {
    type: `[${typeName}]`,
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
        // @todo use our list of Gatsby node types to do a more performant check
        // on whether this is a Gatsby node or not.
        const node = item.id
          ? context.nodeModel.getNodeById({
              id: item.id,
              type: buildTypeName(item.__typename),
            })
          : null

        if (node) {
          accumulator.push(node)
        } else if (!item.id) {
          accumulator.push(item)
        }

        return accumulator
      }, [])
    },
  }
}
