/**
 * Nothing special here - this is part of the boilerplate code for all examples
 */
module.exports = {
  plugins: [
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
  ],
}
