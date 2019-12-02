import {
  createRemoteMediaItemNode,
  getFileNodeMetaBySourceUrl,
} from "./source-nodes/create-remote-media-item-node"

export default helpers => {
  helpers.createResolvers({
    WpMediaItem: {
      remoteFile: {
        type: `File`,
        resolve: (source, _, context) => {
          const nodeMeta = getFileNodeMetaBySourceUrl(source.sourceUrl)

          if (nodeMeta && nodeMeta.id) {
            return context.nodeModel.getNodeById({
              id: nodeMeta.id,
              type: `File`,
            })
          }

          return null

          // return createRemoteMediaItemNode({
          //   mediaItemNode: source,
          //   helpers,
          // })
        },
      },
    },
  })
}
