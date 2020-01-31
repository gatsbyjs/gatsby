module.exports = {
  siteMetadata: {
    title: `Using @reach/skip-nav`,
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
    `gatsby-plugin-react-helmet`,
  ],
}
