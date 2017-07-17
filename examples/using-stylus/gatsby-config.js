module.exports = {
  plugins: [
    `gatsby-plugin-stylus`, // <--- This is the important part
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
  ],
}

/**
 * NOTE: You can use stylus plugins as well! Just import them as you normally
 * would and pass them to the `use` option of the stylus plugin.
 *
 * --------------------------------------------------------------------------
 *
 * const rupture = require(`rupture`)
 *
 * module.exports = {
 *   plugins: [
 *     {
 *       resolve: `gatsby-plugin-stylus`,
 *       options: {
 *         use: [rupture()],
 *       },
 *     },
 *   ],
 * }
 */
