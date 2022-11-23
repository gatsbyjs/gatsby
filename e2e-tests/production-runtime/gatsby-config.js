const {
  data: headFunctionExportData,
} = require(`./shared-data/head-function-export.js`)

module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    author: `Kyle Mathews`,
    description: `This is site for production runtime e2e tests`,
    // Separate to avoid needing to change other tests that rely on site metadata
    headFunctionExport: headFunctionExportData.queried,
  },
  plugins: [
    `gatsby-plugin-global-style`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-local-worker`,
    `gatsby-ssr-tsx`,
    `gatsby-plugin-node-protocol-test`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-less`,
    `gatsby-plugin-stylus`,
  ].concat(process.env.TEST_PLUGIN_OFFLINE ? [`gatsby-plugin-offline`] : []),
  partytownProxiedURLs: [
    `http://localhost:8888/three.js`,
    `http://localhost:9000/used-by-off-main-thread-2.js`, // Meant to be same site
  ],
}
