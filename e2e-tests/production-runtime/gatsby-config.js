module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    author: `Kyle Mathews`,
    description: `This is site for production runtime e2e tests`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
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
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-less`,
    `gatsby-plugin-stylus`,
  ].concat(process.env.TEST_PLUGIN_OFFLINE ? [`gatsby-plugin-offline`] : []),
}
