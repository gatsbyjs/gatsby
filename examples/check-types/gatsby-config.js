module.exports = {
  siteMetadata: {
    title: `Check types`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    `gatsby-plugin-is-child-of-type`,
  ],
}
