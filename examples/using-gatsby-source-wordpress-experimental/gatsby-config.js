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
      resolve: `gatsby-source-wordpress`,
      options: {
        // url: `http://wpgraphql.local/graphql`,
        url: `https://dev-gatsby-source-wordpress-v4.pantheonsite.io/graphql`,
        // verbose: true,
        excludeFields: [`alots`],
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
  ],
}
