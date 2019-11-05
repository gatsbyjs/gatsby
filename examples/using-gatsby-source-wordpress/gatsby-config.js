module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: `http://wpgraphql.local/graphql`,
      },
    },
    `gatsby-plugin-chakra-ui`,
  ],
}
