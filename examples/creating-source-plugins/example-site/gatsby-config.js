/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  plugins: [
    // loads the source-plugin
    {
      resolve: `source-plugin`,
      options: {
        spaceId: "123",
        preview: true,
        cacheResponse: false,
      },
    },
    // required to generate optimized images
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
}
