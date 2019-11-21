module.exports = {
  siteMetadata: {
    title: `sourcing markdown recipe`,
    description: `Example sourcing markdown`,
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
