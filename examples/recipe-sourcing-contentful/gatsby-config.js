module.exports = {
  siteMetadata: {
    title: `Gatsby Contentful Recipe`,
    description: `Example Gatsby site sourcing data from Contentful.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `[space ID]`,
        accessToken: `[access token]`,
      },
    },
    `gatsby-transformer-remark`,
  ],
}
