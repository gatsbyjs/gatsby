module.exports = {
  siteMetadata: {
    title: `Image Gallery example`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/data`,
      },
    },
    `gatsby-sharp`,
    `gatsby-parser-sharp`,
    `gatsby-parser-json`,
    `gatsby-typegen-filesystem`,
    `gatsby-typegen-sharp`,
    `gatsby-plugin-glamor`,
  ],
}
