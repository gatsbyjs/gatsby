import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"

const state = store.getState()
const { fieldAliases } = state.introspection

const transformFields = ({ fields, gatsbyNodeTypes }) => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((accumulator, current) => {
    // this is used to alias fields that conflict with Gatsby node fields
    // for ex Gatsby and WPGQL both have a `parent` field
    const name =
      fieldAliases && fieldAliases[current.name]
        ? fieldAliases[current.name]
        : current.name

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
      current.type &&
      current.type.name &&
      current.type.name.includes(`Connection`)
    ) {
      accumulator[name] = `Wp${current.type.name}`
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

    const typeName = `Wp${current.type.name}`
    const isAGatsbyNode = gatsbyNodeTypes.includes(current.type.name)

    // link gatsby nodes by id
    if (current.type.kind === `OBJECT` && isAGatsbyNode) {
      accumulator[name] = {
        type: typeName,
        resolve: (source, args, context, info) => {
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
    }

    if (current.type.kind === `LIST`) {
      const type = `Wp${current.type.ofType.name}`

      if (current.type.ofType.kind === `OBJECT`) {
        accumulator[name] = {
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
        return accumulator
      }

      // link unions of Gatsby nodes by id
      if (current.type.ofType.kind === `UNION`) {
        accumulator[name] = {
          type: `[${type}]`,
          resolve: (source, args, context, info) => {
            const field = source[name]

            if (!field || !field.length) {
              return null
            }

            return field.map(item => {
              const node = context.nodeModel.getNodeById({
                id: item.id,
                type: `Wp${item.__typename}`,
              })

              if (node) {
                return node
              }

              return item
            })
          },
        }

        return accumulator

        // otherwise use the default resolver parent.fieldName/source.fieldName
      } else if (current.type.ofType.kind === `UNION` && !isAGatsbyNode) {
        accumulator[name] = {
          type: `[${type}]`,
          resolve: source => dump(current.type) && dd(source),
        }

        return accumulator
      }

      if (current.type.ofType.kind === `SCALAR`) {
        accumulator[name] = {
          type: `[${current.type.ofType.name}]`,
        }

        return accumulator
      }
    }

    if (current.type.kind === `UNION`) {
      accumulator[name] = {
        type: `Wp${current.type.name}`,
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
      return accumulator
    }

    // unhandled fields are removed from the schema by not mutating the accumulatorumulator
    return accumulator
  }, {})
}

export default async ({ actions, schema }) => {
  const { data } = store.getState().introspection.introspectionData

  let typeDefs = []

  const mutationTypes = data.__schema.mutationType.fields.map(
    field => field.type.name
  )

  const gatsbyNodeTypes = getContentTypeQueryInfos().map(
    query => query.typeInfo.nodesTypeName
  )

  data.__schema.types
    .filter(
      type =>
        // remove unneeded types
        type.name !== `RootQuery` &&
        type.kind !== `SCALAR` &&
        type.kind !== `ENUM` &&
        type.kind !== `INPUT_OBJECT` &&
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
            resolveType: node => {
              if (node.type) {
                return `Wp${node.type}`
              }

              if (node.__typename) {
                return `Wp${node.__typename}`
              }

              return null
            },
          })
        )
        return
      }

      const transformedFields = transformFields({
        fields: type.fields,
        gatsbyNodeTypes,
      })

      // interfaces dont work properly yet
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

        if (gatsbyNodeTypes.includes(type.name)) {
          objectType.interfaces = [`Node`]
        }

        if (type.name === `MediaItem`) {
          objectType.fields.remoteFile = {
            type: `File`,
            // can't make this work. Created a custom resolver instead.
            // extensions: {
            //   link: {}
            // },
            resolve: (mediaItemNode, args, context, info) => {
              if (!mediaItemNode || !mediaItemNode.remoteFile) {
                return null
              }

              return context.nodeModel.getNodeById({
                id: mediaItemNode.remoteFile.id,
                type: `File`,
              })

              // we could create these remote media item nodes when queried for
              // instead of downloading all referenced nodes and linking by id
              // but it messes up the cli output, and queries are run in order so we wouldn't have parallelized downloads which is too slow
              // anyway we could just put the download here  in the resolver
              // if that ever changes:
              // createRemoteMediaItemNode({
              //   mediaItemNode,
              //   helpers,
              // })
            },
          }
        }

        typeDefs.push(schema.buildObjectType(objectType))

        return
      }
    })

  actions.createTypes(typeDefs)
}
