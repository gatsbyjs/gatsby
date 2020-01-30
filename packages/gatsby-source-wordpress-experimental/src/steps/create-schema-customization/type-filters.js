import { createRemoteMediaItemNode } from "~/steps/source-nodes/create-nodes/create-remote-media-item-node"

export const objectTypeFilters = [
  {
    typeName: `MediaItem`,
    typeDef: (objectType, { pluginOptions }) => {
      objectType.fields.remoteFile = {
        type: `File`,
        resolve: (mediaItemNode, _, context) => {
          if (!mediaItemNode) {
            return null
          }

          const remoteMediaNodeId =
            mediaItemNode.remoteFile && mediaItemNode.remoteFile.id
              ? mediaItemNode.remoteFile.id
              : null

          if (remoteMediaNodeId) {
            const node = context.nodeModel.getNodeById({
              id: mediaItemNode.remoteFile.id,
              type: `File`,
            })

            if (node) {
              return node
            }
          }

          return createRemoteMediaItemNode({
            mediaItemNode,
          })
        },
      }

      return objectType
    },
  },
]
