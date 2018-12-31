module.exports = {
  siteMetadata: {
    title: `Gatsby with Drupal`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src`,
      },
    },
    `gatsby-transformer-asciidoc`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
