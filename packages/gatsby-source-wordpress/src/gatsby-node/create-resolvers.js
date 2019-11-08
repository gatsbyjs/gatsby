import { createRemoteFileNode } from 'gatsby-source-filesystem'

export default helpers => {
    helpers.createResolvers({
    WpMediaItem: {
      imageFile: {
        type: `File`,
        resolve: source => {
          return createRemoteFileNode({
            url: source.sourceUrl,
            ...helpers,
            createNode: helpers.actions.createNode
          })
        }
      }
    }
  })
}