import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"
import { getPluginOptions } from "../../utils/get-gatsby-api"
import { createRemoteMediaItemNode } from "../source-nodes/create-remote-media-item-node"

/**
 * This function namespaces typenames with a prefix
 */
const buildTypeName = name => {
  if (!name || typeof name !== `string`) {
    return null
  }

  const prefix = `Wp`

  return prefix + name
}

/**
 * Transforms fields from the WPGQL schema to work in the Gatsby schema
 * with proper node linking and type namespacing
 * also filters out unusable fields and types
 */
const transformFields = ({
  fields,
  gatsbyNodeTypes,
  fieldAliases,
  fieldBlacklist,
}) => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((accumulator, current) => {
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

    // unhandled fields are removed from the schema by not mutating the accumulatorumulator
    return accumulator
  }, {})
}

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  const typeSettings = store.getState().gatsbyApi.pluginOptions.type

  if (typeSettings[type.name]) {
    return typeSettings[type.name]
  }

  if (type.ofType && typeSettings[type.ofType.name]) {
    return typeSettings[type.ofType.name]
  }

  return {}
}

/**
 * createSchemaCustomization
 */
export default async ({ actions, schema }) => {
  const state = store.getState()
  const {
    fieldAliases,
    fieldBlacklist,
    introspectionData: { data },
  } = state.introspection

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
        // remove types with reserved names
        !type.name.startsWith(`__`) &&
        // remove unneeded types
        type.name !== `RootQuery` &&
        type.kind !== `SCALAR` &&
        type.kind !== `ENUM` &&
        type.kind !== `INPUT_OBJECT` &&
        !mutationTypes.includes(type.name)
    )
    .forEach(type => {
      const thisTypeSettings = getTypeSettingsByType(type)

      if (thisTypeSettings.exclude) {
        return
      }

      if (type.kind === `UNION`) {
        typeDefs.push(
          schema.buildUnionType({
            name: buildTypeName(type.name),
            types: type.possibleTypes.map(possibleType =>
              buildTypeName(possibleType.name)
            ),
            resolveType: node => {
              if (node.type) {
                return buildTypeName(node.type)
              }

              if (node.__typename) {
                return buildTypeName(node.__typename)
              }

              return null
            },
            extensions: { infer: false },
          })
        )
        return
      }

      const transformedFields = transformFields({
        fields: type.fields,
        gatsbyNodeTypes,
        fieldAliases,
        fieldBlacklist,
      })

      if (type.kind === `INTERFACE`) {
        if (thisTypeSettings.nodeInterface) {
          // we add contentType (post type) to all nodes as they're fetched
          // so we can add them to node interfaces as well in order to filter
          // by a couple different content types
          transformedFields[`contentType`] = `String`

          typeDefs.push(
            schema.buildInterfaceType({
              name: buildTypeName(type.name),
              fields: transformedFields,
              extensions: { infer: false, nodeInterface: {} },
            })
          )

          return
        } else {
          typeDefs.push(
            schema.buildInterfaceType({
              name: buildTypeName(type.name),
              fields: transformedFields,
              resolveType: node =>
                node && node.__typename ? buildTypeName(node.__typename) : null,
              extensions: { infer: false },
            })
          )

          return
        }
      }

      if (type.kind === `OBJECT`) {
        let objectType = {
          name: buildTypeName(type.name),
          fields: transformedFields,
          extensions: {
            infer: false,
          },
        }

        // @todo add interfaces to non gatsby node types
        // we need to make sure not to add an interface that uses the nodeInterface extension
        // if this type doesn't implement the Node interface
        if (gatsbyNodeTypes.includes(type.name)) {
          // this is used to filter the allWpContentNode root field
          // by different content types (post types)
          objectType.fields[`contentType`] = `String`

          objectType.interfaces = [
            `Node`,
            ...type.interfaces
              .filter(interfaceType => {
                const interfaceTypeSettings = getTypeSettingsByType(
                  interfaceType
                )
                return !interfaceTypeSettings.exclude
              })
              .map(({ name }) => buildTypeName(name)),
          ]
        }

        if (type.name === `MediaItem`) {
          objectType.fields.remoteFile = {
            type: `File`,
            resolve: (mediaItemNode, _, context) => {
              if (!mediaItemNode) {
                return null
              }

              if (
                !mediaItemNode.remoteFile &&
                !getPluginOptions().type.MediaItem.onlyFetchIfReferenced
              ) {
                // @todo think of a better way to fetch images
                // this isn't such a good way to do it.
                // query running prevents us from downloading a bunch of images in parallell
                // and this also messes up the cli output.
                // for now MediaItem.onlyFetchIfReferenced = true is the recommended way to get media files as that option downloads referenced images upfront
                // where this option fetches images as they're queried for
                // @todo create a clearer plugin option (MediaItem.fetchOnQuery?)
                return createRemoteMediaItemNode({
                  mediaItemNode,
                })
              }

              if (!mediaItemNode.remoteFile) {
                return null
              }

              const node = context.nodeModel.getNodeById({
                id: mediaItemNode.remoteFile.id,
                type: `File`,
              })

              return node
            },
          }
        }

        typeDefs.push(schema.buildObjectType(objectType))

        return
      }
    })

  // dd(await clipboardy.write(JSON.stringify(typeDefs)))
  actions.createTypes(typeDefs)
}
