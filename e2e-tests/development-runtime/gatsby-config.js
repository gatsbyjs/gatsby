const {
  data: headFunctionExportData,
} = require(`./shared-data/head-function-export.js`)

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    author: `@gatsbyjs`,
    social: {
      twitter: `kylemathews`,
    },
    // Separate to avoid needing to change other tests that rely on site metadata
    headFunctionExport: headFunctionExportData.queried,
  },
  graphqlTypegen: true,
  flags: {
    DEV_SSR: false,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content`,
      },
    },
    `gatsby-source-fake-data`,
    `gatsby-source-pinc-data`,
    `gatsby-source-query-on-demand-data`,
    `gatsby-source-fs-route-mutations`,
    `gatsby-browser-tsx`,
    `gatsby-node-typegen`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-subcache`, `gatsby-remark-images`],
      },
    },
    `gatsby-plugin-sharp`,
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
    `gatsby-plugin-image`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-less`,
    `gatsby-plugin-stylus`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
  partytownProxiedURLs: [
    `http://localhost:8888/three.js`,
    `http://localhost:8000/used-by-off-main-thread-2.js`, // Meant to be same site
  ],
}
