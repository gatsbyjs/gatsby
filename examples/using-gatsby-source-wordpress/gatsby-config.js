module.exports = {
  plugins: [
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
        url: `http://wpgraphql.local/graphql`,
      },
    },
    `gatsby-plugin-chakra-ui`,
  ],
}
