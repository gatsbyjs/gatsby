module.exports = {
  siteMetadata: {
    title: `Gatsby with Emotion`,
  },
  plugins: [
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
