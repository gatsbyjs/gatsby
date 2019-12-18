import store from "../../store"

const transformFields = fields => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((acc, curr) => {
    const { name } = curr
    // skip fields that have required arguments
    if (curr.args && curr.args.find(arg => arg.type.kind === `NON_NULL`)) {
      return acc
    }

    if (curr.type && curr.type.name && curr.type.name.includes(`Connection`)) {
      acc[name] = `Wp${curr.type.name}`
      return acc
    }

    // non null scalar types
    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `SCALAR`) {
      acc[name] = `${curr.type.ofType.name}!`
      return acc
    }

    // scalar types
    if (curr.type.kind === `SCALAR`) {
      acc[name] = curr.type.name
      return acc
    }

    // object types should be top level Gatsby nodes
    // so we link them by id
    if (curr.type.kind === `OBJECT`) {
      acc[name] = {
        type: `Wp${curr.type.name}`,
        resolve: (source, args, context, info) => {
          if (!source[name] || (source[name] && !source[name].id)) {
            return null
          }

          return context.nodeModel.getNodeById({
            id: source[name].id,
            type: `Wp${curr.type.name}`,
          })
        },
      }

      return acc
    }

    if (curr.type.kind === `LIST`) {
      const type = `Wp${curr.type.ofType.name}`

      if (curr.type.ofType.kind === `OBJECT`) {
        acc[name] = {
          type: `[${type}]`,
          resolve: (source, args, context, info) => {
            if (source.nodes.length) {
              return context.nodeModel.getNodesByIds({
                ids: source.nodes.map(node => node.id),
                type,
              })
            } else {
              return null
            }
          },
        }
        return acc
      }

      if (curr.type.ofType.kind === `UNION`) {
        acc[name] = {
          type: `[${type}]`,
          resolve: (source, args, context, info) => {
            const field = source[name]

            if (!field || !field.length) {
              return null
            }

            return field.map(item =>
              context.nodeModel.getNodeById({
                id: item.id,
                type: `Wp${item.__typename}`,
              })
            )
          },
        }

        return acc
      }
    }

    // dd(curr)
    // unhandled fields are removed from the schema by not mutating the accumulator
    return acc
  }, {})
}

export default async ({ actions, schema }, pluginOptions) => {
  const { data } = store.getState().introspection.introspectionData

  // const typeMap = new Map(data.__schema.types.map(type => [type.name, type]))

  let typeDefs = []

  const mutationTypes = data.__schema.mutationType.fields.map(
    field => field.type.name
  )

  data.__schema.types
    .filter(
      type =>
        type.name !== `RootQuery` &&
        type.kind !== `SCALAR` &&
        type.kind !== `ENUM` &&
        type.kind !== `INPUT_OBJECT` &&
        // don't create mutation types, we don't need them
        !mutationTypes.includes(type.name)
    )
    .forEach(type => {
      if (type.kind === `UNION`) {
        typeDefs.push(
          schema.buildUnionType({
            name: `Wp${type.name}`,
            types: type.possibleTypes.map(
              possibleType => `Wp${possibleType.name}`
            ),
            resolveType: node => `Wp${node.type}`,
          })
        )
        return
      }

      const transformedFields = transformFields(type.fields)

      if (type.kind === `INTERFACE`) {
        typeDefs.push(
          schema.buildInterfaceType({
            name: `Wp${type.name}`,
            fields: transformedFields,
            resolveType: node => dd(node),
          })
        )

        return
      }

      if (type.kind === `OBJECT`) {
        const objectType = {
          name: `Wp${type.name}`,
          fields: transformedFields,
          extensions: {
            infer: false,
          },
        }

        if (!type.name.includes(`Connection`)) {
          objectType.interfaces = [`Node`]
        }

        typeDefs.push(schema.buildObjectType(objectType))

        return
      }

      dd(type)
    })

  actions.createTypes(typeDefs)
}
