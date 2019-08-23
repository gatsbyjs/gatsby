module.exports = {
  siteMetadata: {
    title: `createPage Recipe`,
    description: `Example using the createPage API`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
  ],
}
