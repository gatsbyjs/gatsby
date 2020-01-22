import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"
import { getPluginOptions } from "../../utils/get-gatsby-api"
import { createRemoteMediaItemNode } from "../source-nodes/create-remote-media-item-node"

import {
  buildTypeName,
  typeWasFetched,
  removeCustomScalars,
  getTypeSettingsByType,
} from "./helpers"

import { transformFields } from "./transform-fields"

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

  const gatsbyNodeTypes = getContentTypeQueryInfos().map(
    query => query.typeInfo.nodesTypeName
  )

  data.__schema.types
    .filter(
      type =>
        typeWasFetched(type) &&
        removeCustomScalars(type) &&
        type.kind !== `SCALAR`
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
        const state = store.getState()
        const { nodeInterfaceTypes } = state.introspection.ingestibles

        if (nodeInterfaceTypes.includes(type.name)) {
          // we add nodeType (post type) to all nodes as they're fetched
          // so we can add them to node interfaces as well in order to filter
          // by a couple different content types
          transformedFields[`nodeType`] = `String`

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

        if (type.interfaces) {
          objectType.interfaces = type.interfaces
            .filter(type => typeWasFetched(type) && removeCustomScalars(type))
            .filter(interfaceType => {
              const interfaceTypeSettings = getTypeSettingsByType(interfaceType)
              return !interfaceTypeSettings.exclude
            })
            .map(({ name }) => buildTypeName(name))
        }

        // @todo add interfaces to non gatsby node types
        // we need to make sure not to add an interface that uses the nodeInterface extension
        // if this type doesn't implement the Node interface
        if (gatsbyNodeTypes.includes(type.name)) {
          // this is used to filter the allWpContentNode root field
          // by different content types (post types)
          objectType.fields[`nodeType`] = `String`

          objectType.interfaces = [`Node`, ...objectType.interfaces]
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
