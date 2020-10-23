module.exports = {
  siteMetadata: {
    title: `Client-Only Paths`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    // used to generate rewrites for client only paths
    // on demo hosted on Netlify
    `gatsby-plugin-netlify`,
  ],
}
