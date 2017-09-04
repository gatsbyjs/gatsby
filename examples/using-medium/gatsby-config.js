module.exports = {
  siteMetadata: {
    title: `Using Medium`,
  },
  plugins: [
    {
      resolve: `gatsby-source-medium`,
      options: {
        username: `smartive`,
      },
    },
  ],
}
