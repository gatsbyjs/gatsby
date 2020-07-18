module.exports = {
  siteMetadata: {
    title: `Gatsby with filbert`,
  },
  plugins: [
    `gatsby-plugin-filbert`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-171640923-2`,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
