import { createRemoteMediaItemNode } from "./source-nodes/create-remote-media-item-node"

export default helpers => {
  helpers.createResolvers({
    WpMediaItem: {
      remoteFile: {
        type: `File`,
        resolve: mediaItemNode =>
          createRemoteMediaItemNode({
            mediaItemNode,
            helpers,
          }),
      },
    },
  })
}
