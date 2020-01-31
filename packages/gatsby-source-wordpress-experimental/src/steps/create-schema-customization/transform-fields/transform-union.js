import { buildTypeName } from "~/steps/create-schema-customization/helpers"

export const transformUnion = ({ field, fieldName }) => ({
  type: buildTypeName(field.type.name),
  resolve: (source, _, context) => {
    const field = source[fieldName]

    if (!field || !field.id) {
      return null
    }

    return context.nodeModel.getNodeById({
      id: field.id,
      type: field.type,
    })
  },
})

export const transformListOfUnions = ({ field, fieldName }) => {
  const typeName = buildTypeName(field.type.ofType.name)

  return {
    type: `[${typeName}]`,
    resolve: (source, _, context) => {
      const field = source[fieldName]

      if (!field || !field.length) {
        return null
      }

      return field.map(item => {
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
