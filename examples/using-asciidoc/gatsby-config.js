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
    {
      resolve: `gatsby-transformer-asciidoc`,
      options: {
        attributes: {
          'skip-front-matter': true
        }
      }
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
