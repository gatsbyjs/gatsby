import { createRemoteMediaItemNode } from "~/steps/source-nodes/create-remote-media-item-node"

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

          if (
            !mediaItemNode.remoteFile &&
            !pluginOptions.type.MediaItem.onlyFetchIfReferenced
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

      return objectType
    },
  },
]
