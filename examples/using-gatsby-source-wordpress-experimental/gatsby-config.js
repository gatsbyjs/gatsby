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
        // url: `http://gatsbysourcewordpressv4.local/graphql`,
        url: `https://dev-gatsby-source-wordpress-v4.pantheonsite.io/graphql`,
        verbose: true,
        // excludeFields: [`alots`],
        nodeSettings: {
          MediaItem: {
            limit: 100,
          },
          Alot: {
            exclude: true,
          },
        },
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
  ],
}
