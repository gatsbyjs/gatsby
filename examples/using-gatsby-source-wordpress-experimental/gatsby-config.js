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
          },
        },
        excludeFields: [
          // `editLock`,
          // `editLast`,
          // `databaseId`,
          `innerBlocks`,
          `attributes`,
          `citation`,
        ],
        schema: {
          queryDepth: 10,
        },
        develop: {
          nodeUpdateInterval: 100,
        },
        type: {
          NodeWithAuthor: {
            exclude: true,
          },
          BlockJsonArray: {
            exclude: true,
          },
          BlockAttributesArray: {
            exclude: true,
          },
          BlockAttributesObject: {
            exclude: true,
          },
          MediaItem: {
            onlyFetchIfReferenced: true,
          },
          // Page: {
          //   limit: 10,
          // },
        },
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
  ],
}
