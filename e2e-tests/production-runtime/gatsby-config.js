module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    author: {
      name: `Kyle Mathews`,
      bio: `lives and works in San Francisco building useful things`,
    },
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
  ].concat(process.env.TEST_PLUGIN_OFFLINE ? [`gatsby-plugin-offline`] : []),
}
