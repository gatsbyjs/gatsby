module.exports = {
  siteMetadata: {
    blogName: `Ghost + Gatsby Demo Blog`,
  },
  plugins: [
    // https://github.com/TryGhost/gatsby-source-ghost/
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Ghost.
     */
    {
      resolve: `gatsby-source-ghost`,
      options: {
        /*
        * See https://github.com/TryGhost/gatsby-source-ghost
        * for the latest information on obtaining the API
        * endpoint. You may need to add the domain that makes
        * calls to the Ghost Public API into the 
        * client_trusted_domains. To do this see
        * https://api.ghost.org/docs/ajax-calls-from-an-external-website
        */
        apiUrl: `https://blog.ghost.org`,
        clientId: `ghost-frontend`,
        clientSecret: `ca4d193a0d90`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-glamor`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
  ],
}
