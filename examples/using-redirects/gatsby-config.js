module.exports = {
  siteMetadata: {
    title: `Using redirects`,
  },
  plugins: [
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    {
      resolve: `gatsby-plugin-redirects`,
      options: {
        redirects: [{
          from: `/d`,
          to: `/a`,
        }],
      },
    },
  ],
}
