import { createRemoteMediaItemNode } from "~/steps/source-nodes/create-nodes/create-remote-media-item-node"

// @todo move this to plugin options
export const typeDefinitionFilters = [
  {
    typeName: `__all`,
    typeDef: typeDef => {
      /**
       * @todo once WPGraphQL has a DateTime Scalar, use that to find date fields
       * instead of the below fieldnames
       */

      if (typeDef?.fields?.date) {
        const dateField = {
          ...typeDef.fields.date,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.date = dateField
      }

      if (typeDef?.fields?.dateGmt) {
        const dateField = {
          ...typeDef.fields.dateGmt,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.dateGmt = dateField
      }

      if (typeDef?.fields?.modified) {
        const dateField = {
          ...typeDef.fields.modified,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.modified = dateField
      }

      if (typeDef?.fields?.modifiedGmt) {
        const dateField = {
          ...typeDef.fields.modifiedGmt,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.modifiedGmt = dateField
      }

      return typeDef
    },
  },
  {
    typeName: `MediaItem`,
    typeDef: objectType => {
      // @todo: this field is deprecated as of 0.1.8, remove this when we get to beta
      objectType.fields.remoteFile = {
        type: `File`,
        deprecationReason: `MediaItem.remoteFile was renamed to localFile`,
        resolve: () => {
          throw new Error(
            `MediaItem.remoteFile is deprecated and has been renamed to MediaItem.localFile. Please update your code.`
          )
        },
      }

      objectType.fields.localFile = {
        type: `File`,
        resolve: (mediaItemNode, _, context) => {
          if (!mediaItemNode) {
            return null
          }

          const localMediaNodeId = mediaItemNode?.localFile?.id

          if (localMediaNodeId) {
            const node = context.nodeModel.getNodeById({
              id: mediaItemNode.localFile.id,
              type: `File`,
            })

            if (node) {
              return node
            }
          }

          return createRemoteMediaItemNode({
            mediaItemNode,
            parentName: `Creating File node while resolving missing MediaItem.localFile`,
          })
        },
      }

      return objectType
    },
  },
]
