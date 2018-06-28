module.exports = {
  siteMetadata: {
    title: `Using Medium`,
  },
  plugins: [
    {
      resolve: `gatsby-source-medium`,
      options: {
        // To test the limit parameter
        // Replace the publication username with a user
        // Limit is optional - set quite low as example user doesn't have that many posts
        username: `smartive`,
        // username: `@ReactEurope`,
        // limit: 20, // note: the graphql query in src/pages/index.js also imposes a limit
      },
    },
  ],
}
