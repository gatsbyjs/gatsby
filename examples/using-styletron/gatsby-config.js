module.exports = {
  siteMetadata: {
    title: `Gatsby with Styletron`,
  },
  plugins: [
    `gatsby-plugin-styletron`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
