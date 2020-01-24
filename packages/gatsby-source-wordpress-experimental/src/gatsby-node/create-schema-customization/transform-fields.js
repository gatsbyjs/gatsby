import {
  buildTypeName,
  typeWasFetched,
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

  return fields
    .filter(field => typeWasFetched(field.type))
    .reduce((accumulator, current) => {
      const thisTypeSettings = getTypeSettingsByType(current.type)

      if (thisTypeSettings.exclude || thisTypeSettings.nodeInterface) {
        return accumulator
      }

      // this is used to alias fields that conflict with Gatsby node fields
      // for ex Gatsby and WPGQL both have a `parent` field
      const name =
        fieldAliases && fieldAliases[current.name]
          ? fieldAliases[current.name]
          : current.name

      if (fieldBlacklist.includes(name)) {
        // skip blacklisted fields
        return accumulator
      }

      // skip fields that have required arguments
      if (
        current.args &&
        current.args.find(arg => arg.type.kind === `NON_NULL`)
      ) {
        return accumulator
      }

      // if we don't have any typenames we can't use this
      if (!current.type.name && !current.type.ofType.name) {
        return accumulator
      }

      if (
        current.type.kind === `NON_NULL` &&
        current.type.ofType.kind === `OBJECT`
      ) {
        return accumulator
      }

      if (
        current.type.kind === `NON_NULL` &&
        current.type.ofType.kind === `ENUM`
      ) {
        return accumulator
      }

      if (
        (current.type.kind === `SCALAR` &&
          !typeIsASupportedScalar(current.type)) ||
        (current.type.ofType &&
          current.type.ofType.kind === `SCALAR` &&
          !typeIsASupportedScalar(current.type))
      ) {
        // if this field is an unsupported custom scalar,
        // typecast it to JSON
        current.type.name = `JSON`
      }

      if (
        current.type &&
        current.type.name &&
        current.type.name.includes(`Connection`)
      ) {
        accumulator[name] = buildTypeName(current.type.name)
        return accumulator
      }

      // non null scalar types
      if (
        current.type.kind === `NON_NULL` &&
        current.type.ofType.kind === `SCALAR`
      ) {
        accumulator[name] = `${current.type.ofType.name}!`
        return accumulator
      }

      // non null list types
      if (
        current.type.kind === `NON_NULL` &&
        current.type.ofType.kind === `LIST`
      ) {
        if (!current.type.ofType.name) {
          return accumulator
        }

        accumulator[name] = `[${current.type.ofType.name}]!`
        return accumulator
      }

      // scalar types
      if (current.type.kind === `SCALAR`) {
        accumulator[name] = current.type.name
        return accumulator
      }

      const typeName = buildTypeName(current.type.name)
      const isAGatsbyNode = gatsbyNodeTypes.includes(current.type.name)

      // link gatsby nodes by id
      if (current.type.kind === `OBJECT` && isAGatsbyNode) {
        accumulator[name] = {
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

        return accumulator

        // for other object types, just use the default resolver
      } else if (current.type.kind === `OBJECT` && !isAGatsbyNode) {
        accumulator[name] = {
          type: typeName,
        }

        return accumulator
      }

      if (current.type.kind === `LIST`) {
        if (current.type.ofType.kind === `OBJECT`) {
          const typeName = buildTypeName(current.type.ofType.name)
          accumulator[name] = {
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
          return accumulator
        }

        // link unions of Gatsby nodes by id
        if (current.type.ofType.kind === `UNION`) {
          const typeName = buildTypeName(current.type.ofType.name)
          accumulator[name] = {
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

          return accumulator
        }

        if (current.type.ofType.kind === `SCALAR`) {
          accumulator[name] = {
            // this is scalar, don't namespace it with buildTypeName()
            type: `[${current.type.ofType.name}]`,
          }

          return accumulator
        }

        if (current.type.ofType.kind === `INTERFACE`) {
          accumulator[name] = {
            type: `[${buildTypeName(current.type.ofType.name)}]`,
          }

          return accumulator
        }
      }

      if (current.type.kind === `UNION`) {
        accumulator[name] = {
          type: buildTypeName(current.type.name),
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
        return accumulator
      }

      if (current.type.kind === `INTERFACE`) {
        accumulator[name] = {
          type: buildTypeName(current.type.name),
        }

        return accumulator
      }

      // unhandled fields are removed from the schema by not mutating the accumulator
      return accumulator
    }, {})
}
