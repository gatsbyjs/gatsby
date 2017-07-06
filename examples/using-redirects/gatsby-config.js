const path = require('path')

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
          component: path.resolve(__dirname, `src/components/RedirectWrapper.js`),
          from: `/d`,
          to: `/a`,
        }],
      },
    },
  ],
}
