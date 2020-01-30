module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    {
      resolve: `gatsby-source-wordpress-experimental`,
      options: {
        url: `http://gatsbysourcewordpressv4.local/graphql`,
        // url: `https://dev-gatsby-source-wordpress-v4.pantheonsite.io/graphql`,
        verbose: true,
        debug: {
          graphql: {
            showQueryOnError: false,
            copyQueryOnError: true,
          },
        },
        excludeFields: [`attributes`],
        schema: {
          queryDepth: 15,
          typePrefix: `Wp`,
        },
        develop: {
          nodeUpdateInterval: 100,
        },
        type: {
          // NodeWithAuthor: {
          //   exclude: true,
          // },
          MediaItem: {
            lazyNodes: false,
          },
          // example of afterRemoteNodeProcessed API
          // Page: {
          //   limit: 10,
          //   afterRemoteNodeProcessed: async ({
          //     remoteNode,
          //     actionType,
          //     wpStore,
          //     fetchGraphql,
          //     helpers,
          //     actions,
          //     buildTypeName,
          //   }) => {
          //     console.log(actionType)

          //     return null
          //   },
          // },
          // Post: {
          //   exclude: true,
          // },
        },
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
  ],
}
