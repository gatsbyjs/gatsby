module.exports = {
  siteMetadata: {
    title: `Gatsby SQIP Example`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `background`,
        path: `${__dirname}/src/background/`,
      },
    },
    `gatsby-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-sqip`,
  ],
}
