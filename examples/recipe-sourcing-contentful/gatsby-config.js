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
        spaceId: `[space ID]`, // or process.env.CONTENTFUL_SPACE_ID
        accessToken: `[access token]`, // or process.env.CONTENTFUL_TOKEN
      },
    },
    `gatsby-transformer-remark`,
  ],
}
