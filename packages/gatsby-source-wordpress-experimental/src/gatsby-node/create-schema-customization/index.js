import store from "../../store"

const state = store.getState()
const { fieldAliases } = state.introspection

const transformFields = fields => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((acc, curr) => {
    // this is used to alias fields that conflict with Gatsby node fields
    // for ex Gatsby and WPGQL both have a `parent` field
    const name =
      fieldAliases && fieldAliases[curr.name]
        ? fieldAliases[curr.name]
        : curr.name

    // skip fields that have required arguments
    if (curr.args && curr.args.find(arg => arg.type.kind === `NON_NULL`)) {
      return acc
    }

    // if we don't have any typenames we can't use this
    if (!curr.type.name && !curr.type.ofType.name) {
      return acc
    }

    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `OBJECT`) {
      return acc
    }

    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `ENUM`) {
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

    // non null list types
    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `LIST`) {
      if (!curr.type.ofType.name) {
        return acc
      }

      acc[name] = `[${curr.type.ofType.name}]!`
      return acc
    }

    // scalar types
    if (curr.type.kind === `SCALAR`) {
      acc[name] = curr.type.name
      return acc
    }

    // object types should be top level Gatsby nodes
    // so we link them by id
    // @todo check if the object type actually is a Gatsby node.
    // in the future WPGQL plugins may add types in unexpected ways
    if (curr.type.kind === `OBJECT`) {
      acc[name] = {
        type: `Wp${curr.type.name}`,
        resolve: (source, args, context, info) => {
          const field = source[name]

          if (!field || (field && !field.id)) {
            return null
          }

          const node = context.nodeModel.getNodeById({
            id: field.id,
            type: `Wp${curr.type.name}`,
          })

          return node
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
              return []
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
              return []
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

      if (curr.type.ofType.kind === `SCALAR`) {
        acc[name] = {
          type: `[${curr.type.ofType.name}]`,
        }

        return acc
      }
    }

    if (curr.type.kind === `UNION`) {
      acc[name] = {
        type: `Wp${curr.type.name}`,
        resolve: (source, args, context, info) => {
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
      return acc
    }

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
        let objectType = {
          name: `Wp${type.name}`,
          fields: transformedFields,
          extensions: {
            infer: false,
          },
        }

        if (!type.name.includes(`Connection`)) {
          objectType.interfaces = [`Node`]
        }

        if (type.name === `MediaItem`) {
          objectType.fields.remoteFile = {
            type: `File`,
            // can't make this work. Created a custom resolver instead.
            // extensions: {
            //   link: {}
            // },
            resolve: (mediaItemNode, args, context, info) =>
              context.nodeModel.getNodeById({
                id: mediaItemNode.remoteFile.id,
                type: `File`,
              }),
            // we could create these remote media item nodes when queried for
            // instead of downloading all referenced nodes and linking by id
            // but it messes up the cli output, and queries are run in order so we wouldn't have parallelized downloads which is slow
            // anyway we could just put the download here  in the resolver
            // if that ever changes:
            // createRemoteMediaItemNode({
            //   mediaItemNode,
            //   helpers,
            // })
          }
        }

        typeDefs.push(schema.buildObjectType(objectType))

        return
      }
    })

  actions.createTypes(typeDefs)
}
