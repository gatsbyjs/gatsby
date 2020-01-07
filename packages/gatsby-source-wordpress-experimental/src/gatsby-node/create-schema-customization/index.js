import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"

const state = store.getState()
const { fieldAliases } = state.introspection

const transformFields = ({ fields, gatsbyNodeTypes }) => {
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

    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `SCALAR`) {
      acc[name] = `${curr.type.ofType.name}!`
      return acc
    }

    if (curr.type.kind === `NON_NULL` && curr.type.ofType.kind === `LIST`) {
      acc[name] = `[${curr.type.ofType.name}]!`
      return acc
    }

    // scalar types
    if (curr.type.kind === `SCALAR`) {
      acc[name] = curr.type.name
      return acc
    }

    const typeName = `Wp${curr.type.name}`
    const isAGatsbyNode = gatsbyNodeTypes.includes(curr.type.name)

    // link gatsby nodes by id
    if (curr.type.kind === `OBJECT` && isAGatsbyNode) {
      acc[name] = {
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

      return acc

      // for other object types, just use the default resolver
    } else if (curr.type.kind === `OBJECT` && !isAGatsbyNode) {
      acc[name] = {
        type: typeName,
      }
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

      // link unions of Gatsby nodes by id
      if (curr.type.ofType.kind === `UNION`) {
        acc[name] = {
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
            description: type.description,
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
            description: type.description,
            resolveType: node => dd(node),
          })
        )

        return
      }

      if (type.kind === `OBJECT`) {
        let objectType = {
          name: `Wp${type.name}`,
          fields: transformedFields,
          description: type.description,
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
            description: type.description,
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
