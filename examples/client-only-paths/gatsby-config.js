module.exports = {
  siteMetadata: {
    title: `Client only paths`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    // used to generate rewrites for client only paths
    // on demo hosted on netlify
    `gatsby-plugin-netlify`,
  ],
}
