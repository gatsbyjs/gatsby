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
        excludeFields: [
          `editLock`,
          `editLast`,
          `contentNodes`,
          `terms`,
          `termNames`,
          `termSlugs`,
        ],
        schema: {
          queryDepth: 10,
        },
        develop: {
          nodeUpdateInterval: 100,
        },
        type: {
          UniformResourceIdentifiable: {
            exclude: true,
          },
          MediaItem: {
            onlyFetchIfReferenced: true,
          },
          Page: {
            limit: 10,
          },
          Post: {
            limit: 10,
          },
          Alot: {
            limit: 50,
          },
        },
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
  ],
}
