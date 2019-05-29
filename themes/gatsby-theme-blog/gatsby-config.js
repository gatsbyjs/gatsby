const path = require(`path`)

module.exports = ({ root }) => {
  return {
    __experimentalThemes: [`gatsby-theme-blog-core`],
    siteMetadata: {
      title: `Gatsby Theme Blog`,
      author: `Kyle Mathews`,
      description: `A starter blog demonstrating what Gatsby can do.`,
      siteUrl: `https://gatsbyjs.github.io/gatsby-starter-blog/`,
    },
    plugins: [
      `gatsby-plugin-emotion`,
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: path.resolve(`./src/assets`),
          name: `pages`,
        },
      },
      {
        resolve: `gatsby-plugin-manifest`,
        options: {
          name: `Gatsby Theme Blog`,
          short_name: `GatsbyJS`,
          start_url: `/`,
          background_color: `#ffffff`,
          theme_color: `#663399`,
          display: `minimal-ui`,
          icon: path.resolve(`src/assets/gatsby-icon.png`),
        },
      },
      `gatsby-plugin-offline`,
      {
        resolve: `gatsby-plugin-typography`,
        options: {
          pathToConfigModule: path.relative(
            root,
            require.resolve(`./src/utils/typography`)
          ),
        },
      },
      {
        resolve: `gatsby-plugin-page-creator`,
        options: {
          path: require.resolve(`./src/pages`),
        },
      },
    ],
  }
}
