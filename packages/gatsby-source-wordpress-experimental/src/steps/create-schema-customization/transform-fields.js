import {
  buildTypeName,
  fieldOfTypeWasFetched,
  typeIsASupportedScalar,
  getTypeSettingsByType,
} from "./helpers"

/**
 * Transforms fields from the WPGQL schema to work in the Gatsby schema
 * with proper node linking and type namespacing
 * also filters out unusable fields and types
 */
export const transformFields = ({
  fields,
  gatsbyNodeTypes,
  fieldAliases,
  fieldBlacklist,
}) => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((fieldsObject, field) => {
    if (!fieldOfTypeWasFetched(field.type)) {
      return fieldsObject
    }

    const thisTypeSettings = getTypeSettingsByType(field.type)

    if (thisTypeSettings.exclude || thisTypeSettings.nodeInterface) {
      return fieldsObject
    }

    // this is used to alias fields that conflict with Gatsby node fields
    // for ex Gatsby and WPGQL both have a `parent` field
    const name =
      fieldAliases && fieldAliases[field.name]
        ? fieldAliases[field.name]
        : field.name

    if (fieldBlacklist.includes(name)) {
      // skip blacklisted fields
      return fieldsObject
    }

    // skip fields that have required arguments
    if (field.args && field.args.find(arg => arg.type.kind === `NON_NULL`)) {
      return fieldsObject
    }

    // if we don't have any typenames we can't use this
    if (!field.type.name && !field.type.ofType.name) {
      return fieldsObject
    }

    if (field.type.kind === `NON_NULL` && field.type.ofType.kind === `OBJECT`) {
      return fieldsObject
    }

    if (field.type.kind === `NON_NULL` && field.type.ofType.kind === `ENUM`) {
      return fieldsObject
    }

    const fieldTypeIsACustomScalar =
      (field.type.kind === `SCALAR` && !typeIsASupportedScalar(field.type)) ||
      (field.type.ofType &&
        field.type.ofType.kind === `SCALAR` &&
        !typeIsASupportedScalar(field.type))

    if (fieldTypeIsACustomScalar) {
      // if this field is an unsupported custom scalar,
      // type it as JSON
      field.type.name = `JSON`
    }

    if (
      field.type &&
      field.type.name &&
      // @todo find a better way than checking the typeName for `Connection`
      field.type.name.includes(`Connection`)
    ) {
      fieldsObject[name] = buildTypeName(field.type.name)
      return fieldsObject
    }

    // non null scalar types
    if (field.type.kind === `NON_NULL` && field.type.ofType.kind === `SCALAR`) {
      fieldsObject[name] = `${field.type.ofType.name}!`
      return fieldsObject
    }

    // non null list types
    if (field.type.kind === `NON_NULL` && field.type.ofType.kind === `LIST`) {
      if (!field.type.ofType.name) {
        return fieldsObject
      }

      fieldsObject[name] = `[${field.type.ofType.name}]!`
      return fieldsObject
    }

    // scalar types
    if (field.type.kind === `SCALAR`) {
      fieldsObject[name] = field.type.name
      return fieldsObject
    }

    const typeName = buildTypeName(field.type.name)
    const isAGatsbyNode = gatsbyNodeTypes.includes(field.type.name)

    // link gatsby nodes by id
    if (field.type.kind === `OBJECT` && isAGatsbyNode) {
      fieldsObject[name] = {
        type: typeName,
        resolve: (source, _, context) => {
          const field = source[name]

          if (!field || (field && !field.id)) {
            return null
          }

          return context.nodeModel.getNodeById({
            id: field.id,
            type: typeName,
          })
        },
      }

      return fieldsObject

      // for other object types, just use the default resolver
    } else if (field.type.kind === `OBJECT` && !isAGatsbyNode) {
      fieldsObject[name] = {
        type: typeName,
      }

      return fieldsObject
    }

    if (field.type.kind === `LIST`) {
      if (field.type.ofType.kind === `OBJECT`) {
        const typeName = buildTypeName(field.type.ofType.name)
        fieldsObject[name] = {
          type: `[${typeName}]`,
          resolve: (source, _, context) => {
            if (source.nodes.length) {
              return context.nodeModel.getNodesByIds({
                ids: source.nodes.map(node => node.id),
                type: typeName,
              })
            } else {
              return null
            }
          },
        }
        return fieldsObject
      }

      // link unions of Gatsby nodes by id
      if (field.type.ofType.kind === `UNION`) {
        const typeName = buildTypeName(field.type.ofType.name)
        fieldsObject[name] = {
          type: `[${typeName}]`,
          resolve: (source, _, context) => {
            const field = source[name]

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

        return fieldsObject
      }

      if (field.type.ofType.kind === `SCALAR`) {
        fieldsObject[name] = {
          // this is scalar, don't namespace it with buildTypeName()
          type: `[${field.type.ofType.name}]`,
        }

        return fieldsObject
      }

      if (field.type.ofType.kind === `INTERFACE`) {
        fieldsObject[name] = {
          type: `[${buildTypeName(field.type.ofType.name)}]`,
        }

        return fieldsObject
      }
    }

    if (field.type.kind === `UNION`) {
      fieldsObject[name] = {
        type: buildTypeName(field.type.name),
        resolve: (source, _, context) => {
          const field = source[name]

          if (!field || !field.id) {
            return null
          }

          return context.nodeModel.getNodeById({
            id: field.id,
            type: field.type,
          })
        },
      }
      return fieldsObject
    }

    if (field.type.kind === `INTERFACE`) {
      fieldsObject[name] = {
        type: buildTypeName(field.type.name),
      }

      return fieldsObject
    }

    // unhandled fields are removed from the schema by not mutating the fieldsObject
    return fieldsObject
  }, {})
}
