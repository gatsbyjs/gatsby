const createResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      fieldAddedByESMPlugin: {
        type: `String`,
        resolve: () => `gatsby-node-engine-bundled-mjs`
      }
    }
  })
}

export { createResolvers } 