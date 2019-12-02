import { createRemoteFileNode } from "gatsby-source-filesystem"

export default helpers => {
  helpers.createResolvers({
    WpMediaItem: {
      remoteFile: {
        type: `File`,
        resolve: source =>
          createRemoteFileNode({
            url: source.sourceUrl,
            ...helpers,
            createNode: helpers.actions.createNode,
          }),
      },
    },
  })
}
